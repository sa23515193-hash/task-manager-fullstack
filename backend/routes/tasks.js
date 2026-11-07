import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { readStore, writeStore } from '../services/store.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.use(requireAuth)
const categories = ['Work','Personal','Study','Health','Other']
const priorities = ['Low','Medium','High','Urgent']
const statuses = ['To Do','In Progress','Completed']
function validate(body, partial=false) {
  const errors=[]
  if (!partial || 'title' in body) if (typeof body.title !== 'string' || !body.title.trim() || body.title.length>100) errors.push('Title is required and must be under 100 characters.')
  if ('description' in body && (typeof body.description !== 'string' || body.description.length>2000)) errors.push('Description must be under 2000 characters.')
  if ('category' in body && !categories.includes(body.category)) errors.push('Invalid category.')
  if ('priority' in body && !priorities.includes(body.priority)) errors.push('Invalid priority.')
  if ('status' in body && !statuses.includes(body.status)) errors.push('Invalid status.')
  if ('dueDate' in body && body.dueDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) errors.push('Due date must use YYYY-MM-DD.')
  return errors
}
router.get('/', async (req,res,next) => { try { const s=await readStore();res.json({tasks:s.tasks.filter(t=>t.userId===req.user.id)}) } catch(e){next(e)} })
router.post('/', async (req,res,next) => {
  try { const errors=validate(req.body||{});if(errors.length)return res.status(400).json({error:errors.join(' ')})
    const s=await readStore();const now=new Date().toISOString();const task={id:randomUUID(),userId:req.user.id,title:req.body.title.trim(),description:req.body.description||'',category:req.body.category||'Other',priority:req.body.priority||'Medium',status:req.body.status||'To Do',dueDate:req.body.dueDate||'',createdAt:now,updatedAt:now}
    s.tasks.unshift(task);await writeStore(s);res.status(201).json({task})
  }catch(e){next(e)}
})
router.get('/:id', async(req,res,next)=>{try{const s=await readStore();const t=s.tasks.find(x=>x.id===req.params.id&&x.userId===req.user.id);if(!t)return res.status(404).json({error:'Task not found.'});res.json({task:t})}catch(e){next(e)}})
router.patch('/:id', async(req,res,next)=>{try{const errors=validate(req.body||{},true);if(errors.length)return res.status(400).json({error:errors.join(' ')})
  const s=await readStore();const i=s.tasks.findIndex(x=>x.id===req.params.id&&x.userId===req.user.id);if(i<0)return res.status(404).json({error:'Task not found.'})
  s.tasks[i]={...s.tasks[i],...req.body,title:req.body.title?.trim()??s.tasks[i].title,updatedAt:new Date().toISOString()};await writeStore(s);res.json({task:s.tasks[i]})
}catch(e){next(e)}})
router.delete('/:id',async(req,res,next)=>{try{const s=await readStore();const n=s.tasks.length;s.tasks=s.tasks.filter(t=>!(t.id===req.params.id&&t.userId===req.user.id));if(n===s.tasks.length)return res.status(404).json({error:'Task not found.'});await writeStore(s);res.json({message:'Task deleted.'})}catch(e){next(e)}})
export default router
