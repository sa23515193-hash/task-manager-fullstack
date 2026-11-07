import { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Columns3, CalendarDays, ChartNoAxesCombined,
  Search, Plus, Bell, ChevronDown, Menu, X, LogOut, Download, Upload,
  MoreHorizontal, ArrowUpRight, Clock3, CircleCheck, CircleAlert, Zap,
  BriefcaseBusiness, UserRound, HeartPulse, BookOpen, Layers3, ListFilter,
  Pencil, Trash2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, PanelLeftClose
} from 'lucide-react'
import {
  getSession, getTasks, getActivity, register, login, logout, saveTask,
  removeTask, moveTask, exportBackup, importBackup, seedDemo
} from './services/storage'

const cx = (...v) => v.filter(Boolean).join(' ')
const today = () => new Date().toISOString().slice(0, 10)
const blank = { title: '', description: '', category: 'Work', priority: 'Medium', status: 'To Do', dueDate: '' }
const categories = ['Work', 'Personal', 'Study', 'Health', 'Other']
const priorities = ['Low', 'Medium', 'High', 'Urgent']
const statuses = ['To Do', 'In Progress', 'Completed']
const iconFor = (c) => ({ Work: BriefcaseBusiness, Personal: UserRound, Study: BookOpen, Health: HeartPulse, Other: Layers3 }[c] || Layers3)
const niceDate = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'No deadline'
const isOverdue = (t) => t.status !== 'Completed' && t.dueDate && t.dueDate < today()
const initials = (name = '') => name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()

function App() {
  const [user, setUser] = useState(getSession)
  const [tasks, setTasks] = useState([])
  const [activity, setActivity] = useState([])
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const refresh = () => {
    if (user) { setTasks(getTasks(user.id)); setActivity(getActivity(user.id)) }
  }
  useEffect(() => { refresh() }, [user])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t) } }, [toast])
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const notify = (message, type = 'success') => setToast({ message, type })
  const onAuth = (next) => { setUser(next); seedDemo(next.id); setTasks(getTasks(next.id)); navigate('/') }
  const onLogout = () => { logout(); setUser(null); setTasks([]); navigate('/login') }
  const persist = (data, id) => { saveTask(user.id, data, id); refresh(); setModal(null); notify(id ? 'Task updated successfully.' : 'Task created successfully.') }
  const remove = (id) => { removeTask(user.id, id); refresh(); setModal(null); notify('Task deleted.', 'info') }
  const changeStatus = (id, status) => { moveTask(user.id, id, status); refresh(); notify(`Moved to ${status}.`) }

  return <div className="app-shell">
    {user ? <>
      <Sidebar open={sidebarOpen} close={() => setSidebarOpen(false)} user={user} onLogout={onLogout} />
      <div className="main-shell">
        <Topbar user={user} onMenu={() => setSidebarOpen(true)} onLogout={onLogout} />
        <main className="page-wrap">
          <Routes>
            <Route path="/" element={<Dashboard user={user} tasks={tasks} activity={activity} openTask={(t) => setModal({ type: 'edit', task: t })} newTask={() => setModal({ type: 'new' })} />} />
            <Route path="/tasks" element={<TasksPage tasks={tasks} onEdit={t => setModal({ type: 'edit', task: t })} onDelete={t => setModal({ type: 'delete', task: t })} onStatus={changeStatus} onNew={() => setModal({ type: 'new' })} onExport={() => exportBackup(user.id)} onImport={async file => { try { const count = await importBackup(user.id, file); refresh(); notify(`Imported ${count} task${count === 1 ? '' : 's'}.`) } catch (e) { notify(e.message || 'Unable to import backup.', 'danger') } }} />} />
            <Route path="/board" element={<Board tasks={tasks} onEdit={t => setModal({ type: 'edit', task: t })} onStatus={changeStatus} />} />
            <Route path="/calendar" element={<Calendar tasks={tasks} onEdit={t => setModal({ type: 'edit', task: t })} />} />
            <Route path="/analytics" element={<Analytics tasks={tasks} activity={activity} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="footer"><span>© 2026 TaskFlow</span><span>Make space for meaningful work <span className="footer-heart">✦</span></span></footer>
      </div>
      {modal && <TaskModal modal={modal} onClose={() => setModal(null)} onSave={persist} onDelete={remove} />}
      {toast && <div className={`toast ${toast.type}`}><CircleCheck size={17}/>{toast.message}</div>}
    </> : <Routes>
      <Route path="*" element={<AuthPage onAuth={onAuth} notify={notify} />} />
    </Routes>}
  </div>
}

function Sidebar({ open, close, user, onLogout }) {
  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/tasks', label: 'My tasks', icon: CheckSquare },
    { to: '/board', label: 'Board view', icon: Columns3 },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  ]
  return <>
    {open && <button className="mobile-scrim" onClick={close} aria-label="Close navigation" />}
    <aside className={cx('sidebar', open && 'sidebar-open')}>
      <div className="brand"><div className="brand-mark"><CheckSquare size={20}/></div><span>taskflow<span className="brand-dot">.</span></span><button className="icon-btn sidebar-close" onClick={close}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-card"><div className="workspace-icon"><Sparkles size={17}/></div><div><strong>Personal space</strong><small>Free workspace</small></div><ChevronDown size={15} className="workspace-chevron"/></div>
      <div className="nav-label">MENU</div>
      <nav className="nav-links">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('nav-link', isActive && 'active')}><Icon size={18}/><span>{label}</span>{label === 'My tasks' && <span className="nav-count"> </span>}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Zap size={17}/></div><strong>Stay in your flow</strong><p>Small steps every day lead to remarkable progress.</p><div className="upgrade-progress"><span/></div><small>Keep your momentum going</small></div>
        <div className="profile-row"><div className="avatar">{initials(user.name)}</div><div className="profile-info"><strong>{user.name}</strong><small>{user.email}</small></div><button className="icon-btn logout-btn" title="Log out" onClick={onLogout}><LogOut size={17}/></button></div>
      </div>
    </aside>
  </>
}

function Topbar({ user, onMenu, onLogout }) {
  const [query, setQuery] = useState('')
  return <header className="topbar">
    <button className="icon-btn mobile-menu" onClick={onMenu}><Menu size={20}/></button>
    <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{({ '/': 'Overview', '/tasks': 'My tasks', '/board': 'Board view', '/calendar': 'Calendar', '/analytics': 'Analytics' })[locationPath()] || 'Overview'}</strong></div>
    <div className="topbar-actions">
      <div className="top-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search anything..." onKeyDown={e => e.key === 'Enter' && window.dispatchEvent(new CustomEvent('taskflow-search', { detail: query }))}/><kbd>⌘ K</kbd></div>
      <button className="icon-btn notification-btn" title="Notifications"><Bell size={18}/><i/></button>
      <div className="top-avatar">{initials(user.name)}</div>
    </div>
  </header>
}
function locationPath() { return window.location.pathname.replace(/\/$/, '') || '/' }

function PageHeading({ eyebrow, title, subtitle, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>
}
function Button({ children, variant = 'primary', ...props }) { return <button className={`btn ${variant}`} {...props}>{children}</button> }
function StatCard({ label, value, note, icon: Icon, tone, trend }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={18}/></span></div><div className="stat-value">{value}</div><div className="stat-note"><span className={trend === 'up' ? 'trend-up' : ''}>{note}</span></div></div>
}
function getStats(tasks) {
  const completed = tasks.filter(t => t.status === 'Completed').length
  return { total: tasks.length, completed, pending: tasks.filter(t => t.status === 'To Do').length, progress: tasks.filter(t => t.status === 'In Progress').length, overdue: tasks.filter(isOverdue).length, urgent: tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length, percent: tasks.length ? Math.round(completed / tasks.length * 100) : 0 }
}
function Dashboard({ user, tasks, activity, openTask, newTask }) {
  const s = getStats(tasks)
  const upcoming = tasks.filter(t => t.status !== 'Completed' && t.dueDate).sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
  const recent = [...activity].slice(0, 5)
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0,10)
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), count: tasks.filter(t => t.status === 'Completed' && t.updatedAt?.slice(0,10) === key).length }
  })
  const max = Math.max(1, ...week.map(x => x.count))
  return <>
    <PageHeading eyebrow="YOUR WORKSPACE" title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user.name.split(' ')[0]} 👋`} subtitle="Here's what's happening with your tasks today." action={<Button onClick={newTask}><Plus size={17}/> New task</Button>} />
    <section className="stats-grid">
      <StatCard label="Total tasks" value={s.total} note="Across all categories" icon={Layers3} tone="violet"/>
      <StatCard label="Completed" value={s.completed} note={`${s.percent}% completion rate`} icon={CircleCheck} tone="green" trend="up"/>
      <StatCard label="In progress" value={s.progress} note="Currently in motion" icon={Clock3} tone="blue"/>
      <StatCard label="Overdue" value={s.overdue} note={s.overdue ? 'Needs your attention' : 'You are all caught up'} icon={CircleAlert} tone="orange"/>
    </section>
    <section className="dashboard-grid">
      <div className="panel progress-panel">
        <div className="panel-heading"><div><h2>Productivity overview</h2><p>Your progress at a glance</p></div><span className="period-pill">Last 7 days</span></div>
        <div className="progress-content"><div className="donut" style={{'--progress': `${s.percent}%`}}><div><strong>{s.percent}%</strong><small>completed</small></div></div><div className="progress-legend"><div><i className="legend-dot violet-dot"/><span>Completed</span><strong>{s.completed}</strong></div><div><i className="legend-dot blue-dot"/><span>In progress</span><strong>{s.progress}</strong></div><div><i className="legend-dot muted-dot"/><span>To do</span><strong>{s.pending}</strong></div></div></div>
        <div className="chart-area"><div className="chart-title">Completed tasks <span>Daily activity</span></div><div className="bar-chart">{week.map((d,i)=><div className="bar-col" key={i}><div className="bar-track"><span style={{height: `${Math.max(5, d.count / max * 100)}%`}}/></div><small>{d.label}</small></div>)}</div></div>
      </div>
      <div className="panel deadlines-panel"><div className="panel-heading"><div><h2>Upcoming deadlines</h2><p>Stay ahead of your schedule</p></div><NavLink to="/tasks" className="text-link">View all <ArrowUpRight size={14}/></NavLink></div>
        {upcoming.length ? <div className="deadline-list">{upcoming.map(t=><button className="deadline-item" key={t.id} onClick={()=>openTask(t)}><div className={`deadline-date ${isOverdue(t) ? 'late' : ''}`}><strong>{new Date(`${t.dueDate}T12:00:00`).getDate()}</strong><small>{new Date(`${t.dueDate}T12:00:00`).toLocaleDateString('en',{month:'short'})}</small></div><div className="deadline-info"><strong>{t.title}</strong><small>{t.category} · {t.priority} priority</small></div><span className={`priority-dot ${t.priority.toLowerCase()}`}/></button>)}</div> : <Empty compact title="No upcoming deadlines" text="Add a due date to keep track of your next milestone."/>}
      </div>
    </section>
    <section className="bottom-grid">
      <div className="panel recent-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>A little progress adds up</p></div><span className="subtle-count">{recent.length} updates</span></div>
        {recent.length ? <div className="activity-list">{recent.map(a=><div className="activity-item" key={a.id}><span className={`activity-icon ${a.type}`}><CircleCheck size={15}/></span><div><strong>{a.message}</strong><small>{timeAgo(a.at)}</small></div></div>)}</div> : <Empty compact title="Nothing here yet" text="Your task activity will show up here."/>}
      </div>
      <div className="panel focus-panel"><div className="focus-art"><div className="focus-orbit orbit-one"/><div className="focus-orbit orbit-two"/><div className="focus-star"><Sparkles size={22}/></div></div><div className="focus-copy"><span className="eyebrow">A GENTLE REMINDER</span><h2>Focus on progress,<br/>not perfection.</h2><p>One clear priority at a time. You've got this.</p><Button variant="soft" onClick={newTask}>Plan a task <ArrowUpRight size={15}/></Button></div></div>
    </section>
  </>
}
function timeAgo(value) { const diff = Math.max(0, Date.now() - new Date(value).getTime()); const m = Math.floor(diff/60000); if(m<1)return 'Just now'; if(m<60)return `${m} min ago`; const h=Math.floor(m/60); if(h<24)return `${h} hr ago`; return `${Math.floor(h/24)} days ago` }

function TasksPage({ tasks, onEdit, onDelete, onStatus, onNew, onExport, onImport }) {
  const fileRef = useRef(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [priority, setPriority] = useState('All')
  const [sort, setSort] = useState('date')
  useEffect(() => { const handler = e => setSearch(e.detail); window.addEventListener('taskflow-search', handler); return () => window.removeEventListener('taskflow-search', handler) }, [])
  const filtered = useMemo(() => tasks.filter(t =>
    `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase()) &&
    (status === 'All' || t.status === status) && (category === 'All' || t.category === category) && (priority === 'All' || t.priority === priority)
  ).sort((a,b) => sort === 'priority' ? priorities.indexOf(b.priority)-priorities.indexOf(a.priority) : sort === 'title' ? a.title.localeCompare(b.title) : (a.dueDate || '9999').localeCompare(b.dueDate || '9999')), [tasks, search, status, category, priority, sort])
  return <>
    <PageHeading eyebrow="STAY ORGANIZED" title="My tasks" subtitle="Manage your priorities and keep your momentum." action={<div className="heading-actions"><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={e => { if (e.target.files?.[0]) onImport(e.target.files[0]); e.target.value = '' }}/><Button variant="secondary" onClick={onExport}><Download size={15}/> Export</Button><Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={15}/> Import</Button><Button onClick={onNew}><Plus size={17}/> Add task</Button></div>}/>
    <div className="panel task-table-panel"><div className="filter-bar"><div className="filter-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..."/></div><div className="filters"><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option>{statuses.map(x=><option>{x}</option>)}</select><select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(x=><option>{x}</option>)}</select><select value={priority} onChange={e=>setPriority(e.target.value)}><option>All</option>{priorities.map(x=><option>{x}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="date">Sort: due date</option><option value="priority">Sort: priority</option><option value="title">Sort: title</option></select></div></div>
      <div className="table-meta"><span>{filtered.length} {filtered.length === 1 ? 'task' : 'tasks'} found</span><span><ListFilter size={14}/> Filters update instantly</span></div>
      {filtered.length ? <div className="task-list">{filtered.map(t=><TaskRow key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onStatus={onStatus}/>)}</div> : <Empty title="No tasks match your filters" text="Try changing your search or add a new task." action={<Button onClick={onNew}><Plus size={16}/> Create task</Button>}/>}
    </div>
  </>
}
function TaskRow({ task:t, onEdit, onDelete, onStatus }) {
  const Cat = iconFor(t.category)
  return <div className="task-row"><button className={cx('task-check', t.status === 'Completed' && 'checked')} onClick={()=>onStatus(t.id, t.status === 'Completed' ? 'To Do' : 'Completed')} title="Toggle complete">{t.status === 'Completed' && <CircleCheck size={15}/>}</button><div className="task-main"><button className={cx('task-title', t.status === 'Completed' && 'is-done')} onClick={()=>onEdit(t)}>{t.title}</button><span>{t.description || 'No description added'}</span></div><span className="category-chip"><Cat size={13}/>{t.category}</span><span className={`priority-label ${t.priority.toLowerCase()}`}>{t.priority}</span><span className={`status-label ${t.status.toLowerCase().replace(' ','-')}`}>{t.status}</span><span className={cx('due-label', isOverdue(t) && 'overdue')}>{isOverdue(t) ? 'Overdue · ' : ''}{niceDate(t.dueDate)}</span><div className="row-actions"><button className="icon-btn" onClick={()=>onEdit(t)} title="Edit"><Pencil size={15}/></button><button className="icon-btn danger-hover" onClick={()=>onDelete(t)} title="Delete"><Trash2 size={15}/></button></div></div>
}
function Board({ tasks, onEdit, onStatus }) {
  const [dragging, setDragging] = useState(null)
  const columns = [{name:'To Do', tone:'todo'}, {name:'In Progress', tone:'progress'}, {name:'Completed', tone:'done'}]
  return <>
    <PageHeading eyebrow="VISUAL WORKFLOW" title="Board view" subtitle="Drag tasks between columns to update their status."/>
    <div className="kanban">{columns.map(col=>{const list=tasks.filter(t=>t.status===col.name);return <section className="kanban-column" key={col.name} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragging)onStatus(dragging,col.name);setDragging(null)}}><div className="kanban-head"><span className={`column-indicator ${col.tone}`}/><strong>{col.name}</strong><span className="column-count">{list.length}</span></div><div className="kanban-cards">{list.map(t=><article key={t.id} className="kanban-card" draggable onDragStart={()=>setDragging(t.id)} onDragEnd={()=>setDragging(null)} onClick={()=>onEdit(t)}><div className="kanban-card-top"><span className="category-chip"><span className={`mini-cat ${t.category.toLowerCase()}`}/>{t.category}</span><MoreHorizontal size={17}/></div><h3>{t.title}</h3><p>{t.description || 'No description'}</p><div className="kanban-card-foot"><span className={`priority-label ${t.priority.toLowerCase()}`}>{t.priority}</span><span className={cx('due-label',isOverdue(t)&&'overdue')}>{niceDate(t.dueDate)}</span></div></article>)}</div></section>})}</div>
  </>
}
function Calendar({ tasks, onEdit }) {
  const [month, setMonth] = useState(new Date())
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first); start.setDate(1 - first.getDay())
  const days = Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})
  const key = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  return <>
    <PageHeading eyebrow="PLAN AHEAD" title="Calendar" subtitle="See your deadlines and commitments in one place."/>
    <div className="panel calendar-panel"><div className="calendar-toolbar"><div><h2>{month.toLocaleDateString('en',{month:'long',year:'numeric'})}</h2><p>{tasks.filter(t=>t.dueDate?.startsWith(`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`)).length} scheduled tasks this month</p></div><div className="month-actions"><button className="btn secondary" onClick={()=>setMonth(new Date())}>Today</button><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>‹</button><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>›</button></div></div><div className="calendar-grid">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=><div className="calendar-weekday">{x}</div>)}{days.map((d,i)=>{const ds=key(d);const list=tasks.filter(t=>t.dueDate===ds);return <div key={i} className={cx('calendar-day',d.getMonth()!==month.getMonth()&&'muted-day',ds===today()&&'today-day')}><span className="day-number">{d.getDate()}</span><div className="day-events">{list.slice(0,2).map(t=><button title={t.title} onClick={()=>onEdit(t)} className={`calendar-event ${t.status==='Completed'?'event-done':t.priority.toLowerCase()}`}>{t.title}</button>)}{list.length>2&&<small>+{list.length-2} more</small>}</div></div>})}</div></div>
  </>
}
function Analytics({ tasks, activity }) {
  const s=getStats(tasks);const cats=categories.map(c=>({name:c,count:tasks.filter(t=>t.category===c).length}));const max=Math.max(1,...cats.map(x=>x.count))
  return <>
    <PageHeading eyebrow="MEASURE YOUR MOMENTUM" title="Analytics" subtitle="Understand your habits and celebrate the work you're doing."/>
    <div className="stats-grid analytics-stats"><StatCard label="Completion rate" value={`${s.percent}%`} note="Of all created tasks" icon={ChartNoAxesCombined} tone="violet"/><StatCard label="Tasks completed" value={s.completed} note="Milestones reached" icon={CircleCheck} tone="green"/><StatCard label="Urgent tasks" value={s.urgent} note="High attention required" icon={Zap} tone="orange"/><StatCard label="Overdue tasks" value={s.overdue} note="Review these deadlines" icon={CircleAlert} tone="blue"/></div>
    <div className="analytics-grid"><div className="panel analytics-panel"><div className="panel-heading"><div><h2>Tasks by category</h2><p>Where your time is going</p></div></div><div className="category-bars">{cats.map(c=><div className="category-bar-row"><div><span>{c.name}</span><strong>{c.count}</strong></div><div className="horizontal-track"><span style={{width:`${c.count/max*100}%`}}/></div></div>)}</div></div><div className="panel analytics-panel"><div className="panel-heading"><div><h2>Task breakdown</h2><p>Current status distribution</p></div></div><div className="breakdown">{statuses.map((st,i)=>{const n=tasks.filter(t=>t.status===st).length;return <div className="breakdown-row"><div className="breakdown-icon">{[<Clock3/>,<Zap/>,<CircleCheck/>][i]}</div><div className="breakdown-text"><strong>{st}</strong><small>{s.total?Math.round(n/s.total*100):0}% of all tasks</small></div><b>{n}</b></div>})}</div></div></div>
    <div className="panel insight-panel"><div className="insight-symbol"><Sparkles size={22}/></div><div><h2>Your productivity snapshot</h2><p>{s.total===0?'Create your first task to start building a picture of your productivity.':`You've completed ${s.completed} of ${s.total} tasks. ${s.percent>=70?'Fantastic momentum — keep protecting your focus time.': 'Choose one small task and make progress today.'}`}</p></div></div>
  </>
}
function Empty({ title, text, action, compact }) { return <div className={cx('empty-state',compact&&'compact-empty')}><div className="empty-icon"><CheckSquare size={21}/></div><strong>{title}</strong><p>{text}</p>{action}</div> }

function TaskModal({ modal, onClose, onSave, onDelete }) {
  const editing=modal.type==='edit';const [form,setForm]=useState(editing?{...modal.task}:blank);const [error,setError]=useState('')
  const submit=e=>{e.preventDefault();if(!form.title.trim()){setError('Please enter a task title.');return}onSave({...form,title:form.title.trim(),description:form.description.trim()},editing?modal.task.id:null)}
  if(modal.type==='delete')return <div className="modal-backdrop" onMouseDown={onClose}><div className="confirm-modal" onMouseDown={e=>e.stopPropagation()}><div className="confirm-icon"><Trash2 size={22}/></div><h2>Delete this task?</h2><p>“{modal.task.title}” will be permanently removed from this browser.</p><div className="modal-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={()=>onDelete(modal.task.id)}>Delete task</Button></div></div></div>
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="task-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">{editing?'TASK DETAILS':'MAKE IT HAPPEN'}</span><h2>{editing?'Edit task':'Create a task'}</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><form onSubmit={submit}><label>Task title <input autoFocus maxLength="100" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Prepare project presentation"/></label><label>Description <textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add a few details to help you get started..."/></label><div className="form-two"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(x=><option>{x}</option>)}</select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{priorities.map(x=><option>{x}</option>)}</select></label></div><div className="form-two"><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{statuses.map(x=><option>{x}</option>)}</select></label><label>Due date<input type="date" value={form.dueDate||''} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label></div>{error&&<div className="form-error">{error}</div>}<div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit"><Plus size={16}/>{editing?'Save changes':'Create task'}</Button></div></form></div></div>
}

function AuthPage({ onAuth }) {
  const [mode,setMode]=useState('login');const [show,setShow]=useState(false);const [form,setForm]=useState({name:'',email:'',password:''});const [error,setError]=useState('');const [busy,setBusy]=useState(false)
  const submit=async e=>{e.preventDefault();setError('');if(mode==='register'&&!form.name.trim())return setError('Please enter your name.');if(!/^\S+@\S+\.\S+$/.test(form.email))return setError('Enter a valid email address.');if(form.password.length<6)return setError('Password must be at least 6 characters.');setBusy(true);try{const u=mode==='login'?await login(form):await register(form);onAuth(u)}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <div className="auth-screen"><div className="auth-decoration decor-a"/><div className="auth-decoration decor-b"/><div className="auth-left"><div className="brand auth-brand"><div className="brand-mark"><CheckSquare size={20}/></div><span>taskflow<span className="brand-dot">.</span></span></div><div className="auth-pitch"><div className="eyebrow">YOUR FOCUS, REIMAGINED</div><h1>Make every day<br/>a <span>little more</span><br/>meaningful.</h1><p>A calmer way to organize your work, stay on top of priorities, and turn plans into progress.</p><div className="auth-proof"><div className="proof-avatars"><span>S</span><span>A</span><span>M</span><span>+</span></div><div><strong>A space for your best work</strong><small>Plan clearly. Move intentionally.</small></div></div></div><div className="auth-foot">Thoughtfully designed for focused minds.</div></div><div className="auth-right"><div className="auth-card"><div className="auth-card-icon"><Sparkles size={20}/></div><span className="eyebrow">{mode==='login'?'WELCOME BACK':'GET STARTED'}</span><h2>{mode==='login'?'Sign in to TaskFlow':'Create your account'}</h2><p>{mode==='login'?'Pick up where you left off.':'A little structure goes a long way.'}</p><form onSubmit={submit}>{mode==='register'&&<label>Full name<div className="input-wrap"><UserRound size={17}/><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></div></label>}<label>Email address<div className="input-wrap"><Mail size={17}/><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></div></label><label>Password<div className="input-wrap"><LockKeyhole size={17}/><input type={show?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/><button type="button" className="password-toggle" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>{error&&<div className="form-error">{error}</div>}<Button type="submit" disabled={busy}>{busy?'Please wait...':mode==='login'?'Sign in':'Create account'} <ArrowUpRight size={16}/></Button></form><div className="auth-switch">{mode==='login'?"Don't have an account?":"Already have an account?"} <button onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Create one':'Sign in'}</button></div><div className="auth-disclaimer">Demo mode · Your data stays in this browser</div></div></div></div>
}

export default App
