import jwt from 'jsonwebtoken'
import { readStore } from '../services/store.js'
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Authentication required.' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const store = await readStore()
    const session = store.sessions.find(s => s.tokenId === payload.jti && s.userId === payload.sub)
    if (!session) return res.status(401).json({ error: 'Session expired. Please sign in again.' })
    req.user = store.users.find(u => u.id === payload.sub)
    if (!req.user) return res.status(401).json({ error: 'User account not found.' })
    req.tokenId = payload.jti
    next()
  } catch { return res.status(401).json({ error: 'Invalid or expired token.' }) }
}
