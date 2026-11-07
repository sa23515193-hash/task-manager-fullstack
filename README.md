# TaskFlow — Smart Full-Stack Task Manager

A polished dark-theme task management workspace built with React, Vite and JavaScript. The repository includes two compatible modes:

1. **GitHub Pages standalone mode** — works independently with browser LocalStorage. No backend, database or API hosting is required.
2. **Optional Express API mode** — a locally runnable REST API with JSON-file persistence, bcrypt password hashing and revocable JWT sessions.

> GitHub Pages only hosts static files. It does **not** run the Express server. Shared server-side data across devices requires deploying the API separately and configuring a frontend API integration. The included Pages build intentionally runs in standalone LocalStorage mode.

## Features

- Registration, login, persistent demo session and logout
- Per-account task storage in LocalStorage
- Create, read, edit, complete and delete tasks
- Search, category/status/priority filters and sorting
- Dashboard metrics, completion ring, recent activity and upcoming deadlines
- Kanban board with drag-and-drop status changes
- Monthly deadline calendar
- Productivity analytics and category breakdown
- JSON backup export and import
- Responsive desktop, tablet and mobile layout
- Toast feedback, validation and delete confirmation
- Optional Express REST API with JSON persistence, validation, CORS, Helmet, rate limiting and centralized errors

## Tech stack

**Frontend:** React 18, Vite 6, React Router, Lucide React, CSS  
**Backend:** Node.js, Express, bcryptjs, JSON Web Tokens, JSON-file persistence  
**Deployment:** GitHub Actions + GitHub Pages

## Run locally — frontend

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/USERNAME/task-manager-fullstack.git
cd task-manager-fullstack
npm install
npm run dev
```

Open the local Vite URL shown in the terminal (normally `http://localhost:5173`). Create an account to start. A small sample workspace is seeded on first registration.

Production build check:

```bash
npm run build
npm run preview
```

## Run the optional backend

Open a second terminal from the project root:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` (PowerShell):

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` and set a unique long `JWT_SECRET`, then run:

```bash
npm run dev
```

The API starts at `http://localhost:5000`. Verify it at `http://localhost:5000/api/health`.

Full endpoint documentation and example payloads: [`backend/README.md`](backend/README.md).

The provided React app is intentionally configured to use LocalStorage, not this optional API. This keeps the GitHub Pages application independent of a separately hosted backend.

## GitHub Pages deployment

1. Create a GitHub repository named **`task-manager-fullstack`**.
2. Upload/push the project contents to the repository's `main` branch.
3. In GitHub, open **Settings → Pages** and set the source to **GitHub Actions**.
4. Open the **Actions** tab and wait for “Deploy TaskFlow to GitHub Pages” to finish.
5. Visit `https://USERNAME.github.io/task-manager-fullstack/`.

The workflow builds the Vite frontend and deploys `dist`. `vite.config.js` sets `/task-manager-fullstack/` as the production base path in GitHub Actions. If you rename the repository, update that base path too.

## LocalStorage, privacy and security notes

- Browser-mode accounts and tasks are stored in the browser's LocalStorage. Data is specific to that browser profile and device; it does not synchronize between devices.
- This is a learning/demo authentication flow, **not secure production authentication**. The standalone demo stores credentials in browser storage and should not be used for real or sensitive accounts.
- Clearing browser site data can erase the workspace. Use **Export JSON** regularly to keep a backup.
- The optional backend hashes passwords and uses signed, expiring, revocable bearer tokens. JSON-file persistence is appropriate for a local demonstration, not a multi-instance production service.
- Never commit `.env`, secrets, or real user data.

## Project structure

```text
task-manager-fullstack/
├── .github/workflows/deploy.yml
├── backend/
│   ├── data/.gitkeep
│   ├── middleware/{auth.js,errors.js}
│   ├── routes/{auth.js,tasks.js}
│   ├── services/store.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── public/
├── src/
│   ├── services/storage.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Useful commands

| Command | Purpose |
|---|---|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start Vite development server |
| `npm run build` | Create production frontend in `dist/` |
| `npm run preview` | Preview production build locally |
| `cd backend && npm install` | Install API dependencies |
| `cd backend && npm run dev` | Start local Express API |

## Internship submission checklist

- [x] React + Vite frontend
- [x] Standalone GitHub Pages mode
- [x] LocalStorage registration, login and task persistence
- [x] Task CRUD, filters and search
- [x] Dashboard, Kanban, calendar and analytics
- [x] JSON import/export
- [x] Express REST API source
- [x] JSON-file backend persistence
- [x] Password hashing and JWT sessions
- [x] API documentation and environment examples
- [x] GitHub Actions Pages workflow
- [ ] Push to your own GitHub repository and confirm the Actions deployment
- [ ] Run local installation/build/API checks in your environment

---

Built as an internship learning project. TaskFlow is a demonstration application, not a production security or data-storage service.
