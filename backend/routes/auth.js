import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { readStore, writeStore } from '../services/store.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
const emailOk = value => /^\S+@\S+\.\S+$/.test(value)
function issue(user, store, res) {
  const tokenId = randomUUID()
  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: user.id, jwtid: tokenId, expiresIn: process.env.TOKEN_TTL || '7d' })
  store.sessions.push({ tokenId, userId: user.id, createdAt: new Date().toISOString() })
  return writeStore(store).then(() => res.json({ token, user: { id: user.id, name: user.name, email: user.email } }))
}
router.post('/register', async (req,res,next) => {
  try {
    const { name, email, password } = req.body || {}
    if (!name?.trim() || !emailOk(email || '') || typeof password !== 'string' || password.length < 8)
      return res.status(400).json({ error: 'Name, valid email and password (8+ characters) are required.' })
    const store = await readStore()
    if (store.users.some(u => u.email === email.toLowerCase())) return res.status(409).json({ error: 'Email is already registered.' })
    const user = { id: randomUUID(), name: name.trim(), email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), createdAt: new Date().toISOString() }
    store.users.push(user); await issue(user, store, res)
  } catch(e) { next(e) }
})
router.post('/login', async (req,res,next) => {
  try {
    const { email, password } = req.body || {}
    if (!emailOk(email || '') || typeof password !== 'string') return res.status(400).json({ error: 'Valid email and password are required.' })
    const store = await readStore(); const user = store.users.find(u => u.email === email.toLowerCase())
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' })
    await issue(user, store, res)
  } catch(e) { next(e) }
})
router.post('/logout', requireAuth, async (req,res,next) => {
  try { const store = await readStore(); store.sessions = store.sessions.filter(s => s.tokenId !== req.tokenId); await writeStore(store); res.json({ message: 'Signed out successfully.' }) } catch(e) { next(e) }
})
router.get('/me', requireAuth, (req,res) => res.json({ user: { id:req.user.id, name:req.user.name, email:req.user.email } }))
export default router
