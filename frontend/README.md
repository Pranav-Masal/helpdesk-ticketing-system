# HelpDesk Pro Frontend

Ready-made static frontend for the existing Django REST API.

## Run
1. Start backend: `python manage.py runserver`
2. Keep API at `http://127.0.0.1:8000/api`
3. Open `index.html` with VS Code Live Server.
4. If backend URL differs, edit `js/config.js`.

Pages: index, login, register, dashboard, tickets, create-ticket, ticket-details.

Expected API endpoints:
- POST /auth/register/
- POST /auth/login/
- GET /auth/me/
- GET/POST /tickets/
- GET /tickets/{id}/
- GET/POST /tickets/{id}/comments/
- PATCH /tickets/{id}/status/
- POST /tickets/{id}/resolve/
- POST /tickets/{id}/close/
- GET /dashboard/stats/
