# HelpDesk Pro Backend

Django REST Framework API for the HelpDesk Pro ticketing system.

## Setup

```powershell
python -m venv env
.\env\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `.env` using `.env.example` and run:

```powershell
python manage.py migrate
python manage.py runserver
```

## API

- `/api/auth/register/`
- `/api/auth/login/`
- `/api/auth/me/`
- `/api/tickets/`
- `/api/tickets/<id>/`
- `/api/tickets/<id>/comments/`
- `/api/tickets/<id>/assign/`
- `/api/tickets/<id>/status/`
- `/api/tickets/<id>/resolve/`
- `/api/tickets/<id>/close/`
- `/api/tickets/agents/`
- `/api/tickets/dashboard/stats/`
- `/api/docs/`
