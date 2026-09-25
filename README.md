# Help Desk Ticketing System 🎫

A full-stack **Help Desk / Ticketing System** built with **Django REST Framework, PostgreSQL, Docker, HTML, CSS and JavaScript**.

The system provides role-based access for **Customers, Support Agents and Company Administrators**, allowing organizations to manage support tickets through their complete lifecycle.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Customer registration and login
* Agent registration
* Private Admin provisioning
* Role-based access control
* Protected API endpoints
* Active/inactive account management

### 👤 Customer

* Register and login
* Create support tickets
* View own tickets
* View ticket details
* Add comments
* Close resolved tickets

### 🧑‍💻 Support Agent

* Apply for Agent registration
* Wait for Admin approval
* Login only after approval
* View available tickets
* Assign tickets
* Update ticket status
* Add comments
* Resolve tickets

### 🛡️ Company Admin

* Private Admin account provisioning
* View dashboard statistics
* View pending Agent registrations
* Approve or reject Agents
* Activate/deactivate Agents
* Manage tickets
* Monitor the support system

---

## 🔄 Ticket Workflow

```text
OPEN
  ↓
ASSIGNED
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

Customers can close a ticket only after it has been resolved.

---

## 👥 Role Flow

```text
Company HR / Authorized Person
              ↓
            ADMIN
              ↓
      Approve / Reject Agent
              ↓
            AGENT
              ↓
          CUSTOMER
```

Admin registration is intentionally not publicly available.

---

## 🛠️ Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT
* PostgreSQL
* django-filter
* drf-spectacular

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API

### DevOps

* Docker
* Docker Compose
* Git
* GitHub

### API Documentation

* Swagger / OpenAPI

---

## 📁 Project Structure

```text
helpdesk_final/
│
├── backend/
│   ├── accounts/
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── create_company_admin.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── tickets/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── permissions.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── tests.py
│   │
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── admin-dashboard.html
│   ├── agent-dashboard.html
│   ├── dashboard.html
│   ├── login.html
│   ├── register.html
│   ├── ticket-details.html
│   └── tickets.html
│
├── .gitignore
└── README.md
```

---

## 🔑 Authentication

The application uses **JWT authentication**.

After successful login, the API returns:

```text
Access Token
Refresh Token
```

The frontend uses the access token for protected API requests.

---

## 📚 API Documentation

After starting the backend, Swagger documentation is available at:

```text
http://127.0.0.1:8000/api/docs/
```

The Swagger interface can be used to explore and test the REST API endpoints.

---

## 🐳 Running With Docker

### 1. Clone the repository

```bash
git clone https://github.com/Pranav-Masal/helpdesk-ticketing-system.git
```

```bash
cd helpdesk-ticketing-system
```

### 2. Start Docker

```bash
cd backend
docker compose up -d --build
```

### 3. Run migrations

```bash
docker compose exec web python manage.py migrate
```

### 4. Create the private Company Admin

```bash
docker compose exec web python manage.py create_company_admin \
  --username companyadmin \
  --email companyadmin@helpdesk.com \
  --password YOUR_SECURE_PASSWORD \
  --first-name Company \
  --last-name Admin
```

### 5. Check containers

```bash
docker compose ps
```

The backend should be available at:

```text
http://127.0.0.1:8000/
```

Swagger:

```text
http://127.0.0.1:8000/api/docs/
```

---

## 🗄️ Database

The project uses:

```text
PostgreSQL
```

Docker Compose runs PostgreSQL as a separate container.

```text
Django API
    ↓
PostgreSQL
```

Database credentials should be supplied through environment variables in production.

---

## 🔒 Security Design

The project follows role-based security principles:

* Admin cannot be created through public registration
* Agent accounts require Admin approval
* Pending Agents cannot log in
* Rejected Agents cannot log in
* Inactive accounts cannot log in
* Customers can access their own tickets
* Agents can manage support tickets according to their permissions
* Admin has administrative access
* Sensitive environment files are excluded from Git

---

## 🧪 Testing

The backend includes Django/REST API tests covering important application behavior such as:

* Authentication
* Ticket creation
* Ticket permissions
* Role-based access
* Ticket operations
* Agent management

Run tests with:

```bash
docker compose exec web python manage.py test
```

---

## 📌 Example API Areas

```text
/api/auth/
/api/auth/login/
/api/auth/register/
/api/auth/agent-register/
/api/auth/me/

/api/tickets/
/api/tickets/agents/
/api/tickets/agents/pending/
/api/tickets/dashboard/stats/

/api/schema/
/api/docs/
```

---

## 🎯 Project Objective

The goal of this project is to demonstrate practical backend development skills through a real-world support ticket management application.

It demonstrates:

* REST API development
* JWT authentication
* Role-based permissions
* Database integration
* PostgreSQL
* Docker containerization
* API documentation
* Backend testing
* Frontend API integration
* Git and GitHub workflow

---

## 🔮 Future Improvements

Possible future improvements include:

* Email notifications
* Real-time notifications using WebSockets
* File attachments
* Ticket priority levels
* Advanced search and filtering
* Production deployment
* CI/CD pipeline
* Automated API testing
* Monitoring and logging

---

## 👨‍💻 Author

**Pranav Masal**

Python / Django Backend Developer

GitHub: [Pranav-Masal](https://github.com/Pranav-Masal)

---

## ⭐ Project Status

```text
Development completed
Core functionality tested
Docker configured
PostgreSQL configured
Swagger configured
GitHub repository configured
```
