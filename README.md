# 🚀 TaskFlow – Smart Full-Stack Task Manager

A modern, professional task management application designed to help users organize tasks, track productivity, manage deadlines, and improve daily workflow.

Built as **Task 2 – Final Project (Weeks 3–4)** for a Full Stack Web Development Internship.

## 🌟 Project Overview

TaskFlow is a responsive SaaS-style task management platform featuring a premium dark dashboard, task organization, productivity analytics, and authentication.

The application supports two operating modes:

1. **Standalone Mode:** Runs independently on GitHub Pages using browser LocalStorage.
2. **Backend Mode:** Uses a Node.js and Express REST API with JSON-file persistence.

No external database is required.

## ✨ Features

### 🔐 Authentication
- User registration and login.
- Password visibility toggle.
- Form validation.
- Persistent login sessions.
- User-specific task management.
- Logout functionality.

### 📊 Dashboard
- Total tasks overview.
- Completed tasks.
- Pending tasks.
- In-progress tasks.
- Overdue tasks.
- Urgent task tracking.
- Completion percentage.
- Productivity analytics.
- Upcoming deadlines.

### 📝 Task Management
- Create new tasks.
- View task details.
- Edit existing tasks.
- Delete tasks.
- Update task status.
- Set task priorities.
- Assign categories.
- Manage due dates.

### 🔍 Organization
- Search tasks.
- Filter by category.
- Filter by status.
- Filter by priority.
- Sort tasks.
- Track overdue deadlines.
- View completed tasks.

### 📌 Advanced Features
- Kanban board.
- Drag-and-drop task management.
- Calendar deadline view.
- Productivity tracking.
- JSON backup export.
- JSON backup import.
- Toast notifications.
- Responsive navigation.
- Confirmation dialogs.

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- CSS3
- Lucide React
- Browser LocalStorage

### Backend
- Node.js
- Express.js
- REST API
- JSON-file persistence
- JWT Authentication
- Password Hashing
- Middleware
- Environment Variables

### Deployment
- GitHub
- GitHub Actions
- GitHub Pages

## 🎨 UI Design

TaskFlow features a premium dark SaaS interface with:

- Modern dashboard layout.
- Dark navy background.
- Electric violet and blue accents.
- Professional cards.
- Responsive components.
- Smooth transitions.
- Clean typography.

## 📂 Project Structure

```text
task-manager-fullstack/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── styles/
│   ├── assets/
│   └── App.jsx
│
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── services/
│   ├── data/
│   └── server.js
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
└── .env.example
```

## 💻 Installation and Setup

### Prerequisites

Install:

- Node.js
- npm
- Visual Studio Code
- Git

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/task-manager-fullstack.git
```

### 2. Open Project

```bash
cd task-manager-fullstack
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Start Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## ⚙️ Backend Setup

Open another terminal.

```bash
cd backend
npm install
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Configure your environment variables, including a strong JWT secret.

Start the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## 🌐 GitHub Pages Deployment

TaskFlow supports automatic deployment through GitHub Actions.

### Deployment Steps

1. Create a GitHub repository named `task-manager-fullstack`.
2. Upload the complete project.
3. Push the code to the `main` branch.
4. Open repository Settings.
5. Select Pages.
6. Choose GitHub Actions as the deployment source.
7. Open the Actions tab.
8. Wait for the deployment workflow to complete.

### Live Website

```text
https://USERNAME.github.io/task-manager-fullstack/
```

Replace `USERNAME` with your GitHub username.

## 💾 Data Storage

### Standalone Mode

The GitHub Pages application uses browser LocalStorage.

Features:
- User-specific tasks.
- Persistent browser data.
- Saved login sessions.
- JSON backup and restore.

**Important:** LocalStorage is device- and browser-specific. It is not secure production authentication and does not synchronize data between users or devices.

### Backend Mode

The Express backend uses local JSON files for persistence.

It provides:
- Registration.
- Login.
- Logout.
- Authentication middleware.
- Task CRUD endpoints.
- Input validation.
- Centralized error handling.

The backend must run separately. GitHub Pages does not host Node.js applications.

For shared server-side persistence, deploy the API independently and configure the frontend to use its API URL.

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/tasks` | Get user tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task details |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

Protected endpoints require valid authentication.

## 📋 Task Categories

- Work
- Personal
- Study
- Health
- Other

## 🚦 Task Priorities

- Low
- Medium
- High
- Urgent

## 📌 Task Status

- To Do
- In Progress
- Completed

## 🔒 Security Notes

- Password hashing is implemented in backend mode.
- Authentication uses token-based handling.
- Environment secrets should never be committed.
- LocalStorage authentication is intended for demonstration purposes.
- Production deployment requires HTTPS, secure token handling, and an independently hosted backend.

## 🎯 Internship Project Objectives

This project demonstrates practical knowledge of:

- React component architecture.
- Frontend state management.
- Responsive UI development.
- REST API development.
- Node.js and Express.
- Authentication.
- CRUD operations.
- LocalStorage.
- JSON data persistence.
- GitHub Actions.
- GitHub Pages deployment.
- Full-stack application architecture.

## 👩‍💻 Developer

**Sawaira Ijaz**

Full Stack Web Developer | React.js | JavaScript | Node.js

GitHub: https://github.com/sa23515193-hash

LinkedIn: https://www.linkedin.com/in/sawaira-ijaz/

Portfolio: https://sa23515193-hash.github.io/MY-CV-portfolio/

## 📄 License

This project is developed for educational and internship purposes.

---

**TaskFlow – Organize Smarter. Work Better. Achieve More.**
