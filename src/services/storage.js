const USERS = 'taskflow_users_v1'
const SESSION = 'taskflow_session_v1'
const TASKS = 'taskflow_tasks_v1'
const ACTIVITY = 'taskflow_activity_v1'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const uid = () => crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const getSession = () => read(SESSION, null)
export const getUsers = () => read(USERS, [])
export const getTasks = (userId) => read(TASKS, []).filter(t => t.userId === userId)
export const getActivity = (userId) => read(ACTIVITY, []).filter(a => a.userId === userId).slice(0, 12)

function record(userId, message, type = 'update') {
  const all = read(ACTIVITY, [])
  all.unshift({ id: uid(), userId, message, type, at: new Date().toISOString() })
  write(ACTIVITY, all.slice(0, 100))
}

export async function register({ name, email, password }) {
  const users = getUsers()
  if (users.some(u => u.email === email.toLowerCase())) throw new Error('An account with this email already exists.')
  const user = { id: uid(), name: name.trim(), email: email.toLowerCase(), password, createdAt: new Date().toISOString() }
  write(USERS, [...users, user])
  const session = { id: user.id, name: user.name, email: user.email }
  write(SESSION, session)
  record(user.id, 'Welcome to TaskFlow — your workspace is ready.', 'success')
  return session
}

export async function login({ email, password }) {
  const user = getUsers().find(u => u.email === email.toLowerCase() && u.password === password)
  if (!user) throw new Error('Email or password is incorrect.')
  const session = { id: user.id, name: user.name, email: user.email }
  write(SESSION, session)
  return session
}

export function logout() { localStorage.removeItem(SESSION) }

export function saveTask(userId, input, id = null) {
  const all = read(TASKS, [])
  const now = new Date().toISOString()
  let saved
  if (id) {
    const index = all.findIndex(t => t.id === id && t.userId === userId)
    if (index < 0) throw new Error('Task not found.')
    saved = { ...all[index], ...input, updatedAt: now }
    all[index] = saved
    record(userId, `Updated “${saved.title}”.`)
  } else {
    saved = { id: uid(), userId, ...input, createdAt: now, updatedAt: now }
    all.unshift(saved)
    record(userId, `Created “${saved.title}”.`, 'success')
  }
  write(TASKS, all)
  return saved
}

export function removeTask(userId, id) {
  const all = read(TASKS, [])
  const task = all.find(t => t.id === id && t.userId === userId)
  if (!task) return
  write(TASKS, all.filter(t => !(t.id === id && t.userId === userId)))
  record(userId, `Deleted “${task.title}”.`, 'danger')
}

export function moveTask(userId, id, status) {
  const task = getTasks(userId).find(t => t.id === id)
  if (!task) return
  const updated = saveTask(userId, { ...task, status }, id)
  if (status === 'Completed' && task.status !== 'Completed') record(userId, `Completed “${task.title}”.`, 'success')
  return updated
}

export function exportBackup(userId) {
  const payload = { app: 'TaskFlow', version: 1, exportedAt: new Date().toISOString(), tasks: getTasks(userId) }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'taskflow-backup.json'; a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(userId, file) {
  const parsed = JSON.parse(await file.text())
  if (parsed.app !== 'TaskFlow' || !Array.isArray(parsed.tasks)) throw new Error('This file is not a valid TaskFlow backup.')
  const current = read(TASKS, [])
  const imported = parsed.tasks.map(t => ({
    id: uid(), userId, title: String(t.title || 'Untitled task').slice(0, 100),
    description: String(t.description || ''), category: t.category || 'Other',
    priority: t.priority || 'Medium', status: t.status || 'To Do',
    dueDate: t.dueDate || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }))
  write(TASKS, [...imported, ...current])
  record(userId, `Imported ${imported.length} task${imported.length === 1 ? '' : 's'} from backup.`, 'success')
  return imported.length
}

export function seedDemo(userId) {
  if (getTasks(userId).length) return
  const today = new Date()
  const date = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10) }
  const samples = [
    ['Finalize portfolio case study', 'Polish project screenshots and write a concise case study.', 'Work', 'High', 'In Progress', date(1)],
    ['Review data structures notes', 'Revise trees, graphs and complexity analysis.', 'Study', 'Urgent', 'To Do', date(0)],
    ['Plan weekly priorities', 'Choose three outcomes to focus on this week.', 'Personal', 'Medium', 'Completed', date(-1)],
    ['Morning walk', 'Take a 25 minute walk and reset.', 'Health', 'Low', 'Completed', date(-2)],
    ['Prepare internship submission', 'Check README, deployment and final project details.', 'Work', 'High', 'To Do', date(3)],
    ['Organize design references', 'Collect UI inspiration for the next dashboard iteration.', 'Personal', 'Medium', 'In Progress', date(5)],
    ['Read one chapter', 'Make short notes from the current book.', 'Other', 'Low', 'To Do', date(8)],
  ]
  const all = read(TASKS, [])
  samples.forEach(([title, description, category, priority, status, dueDate]) => all.push({
    id: uid(), userId, title, description, category, priority, status, dueDate,
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  }))
  write(TASKS, all)
  record(userId, 'Added a starter set of tasks to your workspace.', 'success')
}
