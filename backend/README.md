# TaskFlow Express API

The optional local API uses Express and a JSON file (`backend/data/store.json`) for persistence. It is not deployed by GitHub Pages.

## Setup

```bash
cd backend
npm install
copy .env.example .env
# Edit .env and set a long, random JWT_SECRET
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

## Authentication

Register and login return a bearer token. Send it on protected requests as `Authorization: Bearer <token>`.

- `POST /api/auth/register` — `{ "name": "A User", "email": "a@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/login` — `{ "email": "a@example.com", "password": "..." }`
- `POST /api/auth/logout` — authenticated; revokes the current session
- `GET /api/auth/me` — authenticated; returns the current user

## Tasks

All task endpoints require a bearer token.

- `GET /api/tasks` — list the signed-in user's tasks
- `POST /api/tasks` — create `{ "title": "...", "description": "", "category": "Work", "priority": "Medium", "status": "To Do", "dueDate": "2026-12-01" }`
- `GET /api/tasks/:id` — fetch one task
- `PATCH /api/tasks/:id` — update any supplied fields
- `DELETE /api/tasks/:id` — delete a task

Categories: Work, Personal, Study, Health, Other. Priorities: Low, Medium, High, Urgent. Statuses: To Do, In Progress, Completed.

The API validates input, scopes task access to the authenticated user, hashes passwords with bcrypt, signs expiring JWTs, tracks revocable sessions, limits auth requests, and uses centralized error handling. JSON-file storage is suitable for a local internship demo, not concurrent or high-availability production workloads. Back up `data/store.json` before making manual changes.
