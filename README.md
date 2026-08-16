# Blood Donation Management System

### Service-Oriented Computing – Group Project

A **microservices-based Blood Donation Management System** developed using Spring Boot, Spring Cloud API Gateway, Keycloak OAuth2/OpenID Connect, Redis, MySQL, React, Swagger/OpenAPI, Docker, and Docker Compose.

The system provides secure management of users, blood donations, blood banks, blood stock, and blood requests through independent microservices connected through a centralized API Gateway.

---

## Team Members

| Member | Index Number | Main Contribution |
|---|---|---|
| **Lishani Samarakoon** | **ITBIN-2312-0005** | User/Auth & Security |
| **Wathsala Kithulgala** | **ITBIN-2312-0025** | Donation Management |
| **Seshan Sandeepa** | **ITBIN-2312-0024** | Blood Bank Management |

---

## Project Links

| Resource | Link |
|---|---|
| **GitHub Repository** | [Blood Donation Management System](https://github.com/Lishani-Samarakoon/BloodDonationSystem-New) |
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) |
| **API Gateway** | [http://localhost:8080](http://localhost:8080) |
| **Keycloak** | [http://localhost:8180](http://localhost:8180) |
| **Auth Service Swagger** | [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html) |
| **Donation Service Swagger** | [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html) |
| **Blood Bank Service Swagger** | [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html) |

> **Note:** The frontend, API Gateway, Keycloak, and Swagger links above are local development links. The Docker Compose environment must be running before accessing them.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Main Components](#3-main-components)
4. [API Gateway and Security](#4-api-gateway-and-security)
5. [Keycloak Authentication](#5-keycloak-authentication)
6. [Frontend](#6-frontend)
7. [Technology Stack](#7-technology-stack)
8. [Project Structure](#8-project-structure)
9. [Run the Project](#9-run-the-project)
10. [Environment Configuration](#10-environment-configuration)
11. [Automated Testing](#11-automated-testing)
12. [Team Contributions](#12-team-contributions)
13. [Git and GitHub Workflow](#13-git-and-github-workflow)
14. [Additional Documentation](#14-additional-documentation)
15. [Project Status](#15-project-status)
16. [License](#16-license)

---

# 1. Project Overview

The **Blood Donation Management System** is a Service-Oriented Computing group project designed using a **microservices architecture**.

Instead of implementing the whole system as one application, the main business functions are separated into independent services.

The main system components are:

- User/Auth Service
- Donation Service
- Blood Bank Service
- API Gateway
- React Frontend
- Keycloak Authentication
- Redis Rate Limiting
- MySQL Databases
- Docker Compose Infrastructure

The system supports secure interaction between donors, blood banks, and administrators.

---

# 2. System Architecture

```text
React Client :5173
       |
       | OAuth2 Bearer Token
       v
API Gateway :8080
  - JWT validation
  - Keycloak realm roles
  - CORS
  - Redis rate limiting
  - Internal API-key injection
       |
       +----------------+----------------+
       |                |                |
       v                v                v
User/Auth :8081   Donation :8082   Blood Bank :8083
       |                |                |
       v                v                v
    auth_db        donation_db       bloodbank_db

Keycloak :8180                 Redis :6379
OAuth2 / OpenID Connect        Rate-limit counters
```

The frontend does **not** directly send service API keys.

The communication flow is:

```text
React Frontend
      ↓
OAuth2 Access Token
      ↓
API Gateway
      ↓
JWT Validation
      ↓
Role Authorization
      ↓
Redis Rate Limiting
      ↓
Internal X-API-KEY Injection
      ↓
Microservice
```

The API Gateway removes any client-supplied `X-API-KEY`, adds the correct internal service key, and forwards the request to the required microservice.

---

# 3. Main Components

## 3.1 User/Auth Service

**Port:** `8081`

The User/Auth Service manages application user profiles.

### Main Functions

- Create users
- View users
- View a user by ID
- Update user details
- Delete users
- User validation
- Exception handling
- Internal API-key security
- Swagger/OpenAPI documentation

### API Endpoints

```text
POST   /api/users
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

### Database

```text
auth_db
```

### Swagger

```text
http://localhost:8081/swagger-ui.html
```

---

## 3.2 Donation Service

**Port:** `8082`

The Donation Service manages donor availability and blood donation records.

### Main Functions

- Create donations
- View donations
- View donation by ID
- Search by donor
- Search by blood group
- Search by status
- Update donation information
- Update donation status
- Delete donations
- Donation quantity validation
- Available-date validation
- Exception handling
- Internal API-key security
- Swagger/OpenAPI documentation

### API Endpoints

```text
POST   /api/donations
GET    /api/donations
GET    /api/donations/{id}
GET    /api/donations/donor/{donorId}
GET    /api/donations/blood-group/{bloodGroup}
GET    /api/donations/status/{status}
GET    /api/donations/search
PUT    /api/donations/{id}
PATCH  /api/donations/{id}/status
DELETE /api/donations/{id}
```

### Donation Validation

Donation records require:

- A valid blood group
- Positive blood quantity
- An available date of today or later

### Database

```text
donation_db
```

### Swagger

```text
http://localhost:8082/swagger-ui.html
```

---

## 3.3 Blood Bank Service

**Port:** `8083`

The Blood Bank Service manages:

- Blood banks
- Blood stock
- Blood requests

### Blood Bank Endpoints

```text
POST   /api/bloodbanks
GET    /api/bloodbanks
GET    /api/bloodbanks/{id}
PUT    /api/bloodbanks/{id}
DELETE /api/bloodbanks/{id}
```

### Blood Stock Endpoints

```text
POST   /api/bloodstocks
GET    /api/bloodstocks
GET    /api/bloodstocks/{id}
GET    /api/bloodstocks/blood-bank/{bloodBankId}
GET    /api/bloodstocks/blood-group/{bloodGroup}
PUT    /api/bloodstocks/{id}
DELETE /api/bloodstocks/{id}
```

### Blood Request Endpoints

```text
POST   /api/bloodrequests
GET    /api/bloodrequests
GET    /api/bloodrequests/{id}
GET    /api/bloodrequests/blood-bank/{bloodBankId}
PUT    /api/bloodrequests/{id}
PATCH  /api/bloodrequests/{id}/status
DELETE /api/bloodrequests/{id}
```

### Database

```text
bloodbank_db
```

### Swagger

```text
http://localhost:8083/swagger-ui.html
```

---

# 4. API Gateway and Security

**Gateway URL:**

```text
http://localhost:8080
```

The API Gateway acts as the main entry point between the frontend and backend microservices.

### Gateway Responsibilities

- Service routing
- OAuth2/JWT validation
- Role-based authorization
- CORS handling
- Internal API-key injection
- Redis rate limiting
- Protection of backend services

---

## 4.1 Authentication

Protected `/api/**` requests require a JWT access token issued by the `blood-donation` Keycloak realm.

```text
Authorization: Bearer <access-token>
```

---

## 4.2 Role-Based Authorization

Keycloak realm roles are mapped to Spring Security roles.

| Role | Access |
|---|---|
| `DONOR` | Create/update/delete donations |
| `BLOOD_BANK` | Manage blood banks, stock, and requests |
| `ADMIN` | Full administrative access |
| Authenticated User | Read permitted system information |

Additional authorization rules:

- `DONOR` or `ADMIN` → Donation management
- `BLOOD_BANK` or `ADMIN` → Blood Bank, Stock, and Request management
- `ADMIN` → Delete user profiles

---

## 4.3 Internal Service API Keys

Each microservice is protected using a separate internal API key.

For local direct Swagger/manual testing:

```text
Auth Service:
auth-service-secret-key

Donation Service:
donation-service-secret-key

Blood Bank Service:
bloodbank-service-secret-key
```

The frontend does not directly use these API keys.

The API Gateway automatically injects the correct key when forwarding requests to each microservice.

> These are local development defaults and can be replaced using environment variables.

---

## 4.4 CORS

The API Gateway allows requests from the React frontend:

```text
http://localhost:5173
```

---

## 4.5 Redis Rate Limiting

Redis provides distributed request-rate limiting.

Default development limit:

```text
20 requests / 10 seconds
```

Requests above the limit receive:

```text
HTTP 429 Too Many Requests
```

---

# 5. Keycloak Authentication

**Keycloak URL:**

```text
http://localhost:8180
```

### Realm

```text
blood-donation
```

### Frontend Client

```text
blood-donation-frontend
```

The frontend login uses:

- OAuth2
- OpenID Connect
- Authorization Code Flow
- PKCE (`S256`)
- JWT access tokens

---

## Demo Accounts

| Role | Username | Password |
|---|---|---|
| Donor | `donor1` | `donor123` |
| Blood Bank | `bank1` | `bank123` |
| Admin | `admin1` | `admin123` |

---

## Keycloak Admin Console

```text
http://localhost:8180
```

Default local administrator:

```text
Username: admin
Password: admin123
```

---

## Custom LifeLine Keycloak Theme

The project contains a custom Keycloak login theme:

```text
keycloak/
└── themes/
    └── lifeline/
        └── login/
            ├── theme.properties
            └── resources/
                └── css/
                    └── login.css
```

The theme provides a user interface consistent with the **LifeLine Blood Donation Network** frontend.

---

# 6. Frontend

**Frontend URL:**

```text
http://localhost:5173
```

The frontend is developed using **React and Vite**.

### Frontend Features

- Professional LifeLine login interface
- Keycloak login/logout
- OAuth2 token handling
- Token refresh
- Role-aware controls
- Live dashboard metrics
- User management
- Donation management
- Blood Bank management
- Blood Stock management
- Blood Request management
- Donation status updates
- Blood Request status updates
- Delete operations
- API error handling
- Responsive user interface

The frontend communicates with the backend through the API Gateway instead of directly calling individual microservices.

---

# 7. Technology Stack

| Technology | Purpose |
|---|---|
| Java 21 | Backend development |
| Spring Boot 4.0.7 | Microservice development |
| Spring Cloud 2025.1.2 | API Gateway and cloud components |
| Springdoc OpenAPI 3.0.3 | API documentation |
| React 19 | Frontend development |
| Vite 8 | Frontend build/development |
| Keycloak 26.7.0 | Authentication and authorization |
| OAuth2 / OpenID Connect | Authentication protocol |
| JWT | Access-token authorization |
| MySQL 8 | Microservice databases |
| Redis 7.4 | Distributed rate limiting |
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Maven | Java dependency management |
| Swagger / OpenAPI | API testing and documentation |
| Git | Version control |
| GitHub | Collaboration and Pull Requests |
| PowerShell | Automated smoke testing |

---

# 8. Project Structure

```text
BloodDonationSystem-New/
│
├── api-gateway/
│
├── auth-service/
│
├── bloodbank-service/
│
├── donation-service/
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── api.js
│       ├── auth.js
│       └── main.jsx
│
├── keycloak/
│   ├── realm-config/
│   │   └── blood-donation-realm.json
│   │
│   └── themes/
│       └── lifeline/
│           └── login/
│               ├── theme.properties
│               └── resources/
│                   └── css/
│                       └── login.css
│
├── scripts/
│   └── smoke-test.ps1
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── FIXES_APPLIED.md
├── LICENSE
├── README.md
├── TEAM_GIT_GUIDE.md
└── TESTING_GUIDE.md
```

---

# 9. Run the Project

## Prerequisites

Install:

- Docker Desktop
- Git

---

## Clone the Repository

```powershell
git clone https://github.com/Lishani-Samarakoon/BloodDonationSystem-New.git
```

Open the project:

```powershell
cd BloodDonationSystem-New
```

---

## Start the Complete System

From the project root:

```powershell
docker compose up --build
```

The Docker environment contains:

```text
mysql-auth
mysql-donation
mysql-bloodbank
redis
keycloak
auth-service
donation-service
bloodbank-service
api-gateway
frontend
```

After startup, open:

```text
http://localhost:5173
```

---

## Stop the System

```powershell
docker compose down
```

---

## Stop and Remove Database Volumes

To start again with empty databases:

```powershell
docker compose down -v
```

---

# 10. Environment Configuration

The project contains:

```text
.env.example
```

Create a local environment file if required:

```text
.env
```

The real `.env` file is ignored by Git.

Sensitive information such as:

- Passwords
- API keys
- Tokens
- Private credentials

should not be committed to GitHub.

---

# 11. Automated Testing

The project includes an automated PowerShell smoke-test script.

File:

```text
scripts/smoke-test.ps1
```

After the Docker stack is running, open another PowerShell window in the project root and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

The automated test checks:

- Service health
- OAuth2 authentication
- API-key protection
- JWT access
- CORS
- User creation
- Donation CRUD
- Donation validation
- 404 handling
- Donation status updates
- Blood Bank CRUD
- Blood Stock management
- Blood Request management
- Blood Request status updates
- Redis rate limiting
- Cleanup operations

For the complete testing procedure, see:

[TESTING_GUIDE.md](TESTING_GUIDE.md)

> Test results should only be reported as successful after they have been executed and verified on the project environment.

---

# 12. Team Contributions

The project was developed collaboratively by three members using separate Git branches and Pull Requests.

---

## Member 1 – Lishani Samarakoon

**Index Number:** `ITBIN-2312-0005`  
**GitHub:** `Lishani-Samarakoon`  
**Branch:** `feature/user-auth-security`

### Main Contribution – User/Auth & Security

- User/Auth microservice
- User entity and persistence
- User CRUD REST APIs
- User validation
- Exception handling
- Internal API-key security
- Swagger/OpenAPI configuration
- Keycloak realm configuration
- User/Auth API testing
- Authentication and security-related functionality

---

## Member 2 – Wathsala Kithulgala

**Index Number:** `ITBIN-2312-0025`  
**GitHub:** `wathsala2001`  
**Branch:** `feature/donation-management`

### Main Contribution – Donation Management

- Donation microservice
- Donation entity and persistence
- Donation CRUD REST APIs
- Search by donor
- Search by blood group
- Search by donation status
- Donation status management
- Quantity validation
- Available-date validation
- Exception handling
- Internal API-key security
- Swagger/OpenAPI configuration
- Donation API testing
- Donation integration testing

---

## Member 3 – Seshan Sandeepa

**Index Number:** `ITBIN-2312-0024`  
**GitHub:** `seshansandeepa`  
**Branch:** `feature/bloodbank-infrastructure`

### Main Contribution – Blood Bank Management

- Blood Bank microservice
- Blood Bank entity and persistence
- Blood Bank CRUD REST APIs
- Blood Stock management
- Blood Stock CRUD functionality
- Blood Request management
- Blood Request status management
- Validation
- Exception handling
- Internal API-key security
- Swagger/OpenAPI configuration
- Blood Bank API testing
- Blood Bank integration testing

---

## Shared Group Integration

The following components were completed/integrated as shared group work:

- React frontend
- LifeLine user interface
- API Gateway integration
- Service routing
- OAuth2/JWT integration
- Keycloak integration
- Custom Keycloak LifeLine theme
- CORS configuration
- Service API-key forwarding
- Redis configuration
- Rate limiting
- Docker Compose configuration
- End-to-end integration
- Automated smoke testing
- Project documentation

---

# 13. Git and GitHub Workflow

The team used separate feature branches so individual work could be identified clearly.

| Member / Purpose | Branch |
|---|---|
| Lishani – User/Auth & Security | `feature/user-auth-security` |
| Wathsala – Donation Management | `feature/donation-management` |
| Seshan – Blood Bank Management | `feature/bloodbank-infrastructure` |
| Final Group Integration | `integration/final-project` |
| UI & Keycloak Improvements | `feature/ui-keycloak-improvements` |

### Development Workflow

```text
Individual Development
        ↓
Feature Branch
        ↓
Git Commit
        ↓
Push to GitHub
        ↓
Pull Request
        ↓
Review / Merge
        ↓
Main Branch
        ↓
Final Integration
```

This workflow provides clear GitHub evidence of:

- Individual contributions
- Commit history
- Feature branches
- Pull Requests
- Final integration

---

# 14. Additional Documentation

The repository contains supporting documentation.

### Testing Guide

[TESTING_GUIDE.md](TESTING_GUIDE.md)

Contains the detailed testing procedure.

### Team Git Guide

[TEAM_GIT_GUIDE.md](TEAM_GIT_GUIDE.md)

Contains the team Git and GitHub workflow.

### Fixes Applied

[FIXES_APPLIED.md](FIXES_APPLIED.md)

Contains important project fixes and improvements.

### Environment Example

[.env.example](.env.example)

Contains example environment configuration.

---

# 15. Project Status

| Component | Status |
|---|---|
| User/Auth Service | Complete |
| Donation Service | Complete |
| Blood Bank Service | Complete |
| Blood Stock Management | Complete |
| Blood Request Management | Complete |
| API Gateway | Complete |
| React Frontend | Complete |
| LifeLine UI | Complete |
| Keycloak Authentication | Complete |
| Custom Keycloak Theme | Complete |
| OAuth2 / OpenID Connect | Complete |
| JWT Authorization | Complete |
| Internal API-Key Security | Complete |
| CORS | Complete |
| Redis Rate Limiting | Complete |
| MySQL Databases | Complete |
| Docker Compose | Complete |
| Swagger/OpenAPI | Complete |
| Automated Smoke Testing | Complete |
| GitHub Collaboration | Complete |

---

# 16. License

This project is licensed under the **MIT License**.

See:

[LICENSE](LICENSE)

for more information.

---

## Blood Donation Management System

**LifeLine Network**

Developed collaboratively using:

**Spring Boot • React • Spring Cloud Gateway • Keycloak • OAuth2 • MySQL • Redis • Docker • GitHub**

> **Give Blood. Give Hope. Save Lives.**
