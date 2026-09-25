# HelpDesk Pro — Complete Ticketing System

A full-stack Help Desk / Ticketing System built with Django REST Framework, JWT authentication, PostgreSQL and a responsive HTML/CSS/JavaScript frontend.

## Features

- Customer registration/login with JWT
- Customer dashboard and ticket statistics
- Create, search and filter tickets
- Ticket details and conversation/comments
- Agent/Admin ticket access
- Assign ticket to agent / assign to self
- Ticket workflow: OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
- Resolution notes
- Customer can close resolved tickets
- Swagger/OpenAPI documentation
- PostgreSQL configuration
- CORS for Live Server frontend
- Docker configuration
- Automated backend tests

## Folder structure

- `backend/` — Django REST API
- `frontend/` — static frontend for VS Code Live Server

## Backend setup

```powershell
cd backend
python -m venv env
.\env\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `.env` from `.env.example`, then run:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`
Swagger: `http://127.0.0.1:8000/api/docs/`

## Frontend setup

Open the `frontend` folder in VS Code and run `index.html` with Live Server.

Default API URL is in `frontend/js/config.js`.

## Agent account

Registering through the frontend creates a CUSTOMER. To test the agent workflow, use Django admin or the Django shell to change a user role to `AGENT`.

## Test

```powershell
python manage.py test
```
