<div align="center">

# 🩸 LifeLine Network — Blood Donation Management System

**A production-grade, cloud-ready microservices platform for managing blood donations, blood banks, and donor coordination.**

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.7-6DB33F?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Keycloak](https://img.shields.io/badge/Keycloak-26.7.0-4D4D4D?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[🚀 Quick Start](#-running-the-application) • [🔗 Live Links](#-quick-access-links) • [📖 API Reference](#-microservices--api-reference) • [🏛️ Architecture](#️-system-architecture) • [🧪 Testing](#-automated-testing--smoke-test-suite)

</div>

---

## 📑 Table of Contents

- [🚀 Quick Access Links](#-quick-access-links)
- [👥 Demo User Accounts](#-demo-user-accounts)
- [🏛️ System Architecture](#️-system-architecture)
- [🛡️ Security Architecture](#️-security-architecture)
- [📋 Microservices & API Reference](#-microservices--api-reference)
  - [User / Auth Service](#1-user--auth-service-port-8081)
  - [Donation Service](#2-donation-service-port-8082)
  - [Blood Bank Service](#3-blood-bank-service-port-8083)
- [🛠️ Tech Stack & Versions](#️-tech-stack--versions)
- [🏃 Running the Application](#-running-the-application)
- [🧪 Automated Testing](#-automated-testing--smoke-test-suite)
- [📁 Project Structure](#-project-structure)

---

## 🚀 Quick Access Links

> Start the stack with `docker compose up --build -d` then access all components below:

| Component | URL | Credentials / Notes |
| :--- | :--- | :--- |
| 🌐 **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | React + Vite Single Page Application |
| 🚪 **API Gateway** | [http://localhost:8080](http://localhost:8080) | OAuth2 Bearer Token Protected |
| 🔐 **Keycloak Admin Console** | [http://localhost:8180](http://localhost:8180) | `admin` / `admin` — Realm: `blood-donation` |
| 👤 **User/Auth Service Swagger** | [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html) | API Key: `auth-service-secret-key` |
| 🩸 **Donation Service Swagger** | [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html) | API Key: `donation-service-secret-key` |
| 🏥 **Blood Bank Service Swagger** | [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html) | API Key: `bloodbank-service-secret-key` |
| 💓 **Gateway Health Check** | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) | Liveness & Readiness probes |
| 📊 **Auth DB (MySQL)** | `localhost:3307` | DB: `auth_db` |
| 🩸 **Donation DB (MySQL)** | `localhost:3308` | DB: `donation_db` |
| 🏥 **Blood Bank DB (MySQL)** | `localhost:3309` | DB: `bloodbank_db` |

---

## 👥 Demo User Accounts

Pre-configured Keycloak users with realm roles for immediate testing:

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **System Admin** | `admin1` | `admin123` | Full access: manage users, donations, blood banks, stock & requests |
| 🩸 **Blood Donor** | `donor1` | `donor123` | Create & manage personal donor profile and donation records |
| 🏥 **Blood Bank** | `bank1` | `bank123` | Create & manage blood banks, blood stocks, and blood requests |

> 💡 **How to log in**: Go to [http://localhost:5173](http://localhost:5173) → Click **Sign In** → Use any credentials above.

---

## 🏛️ System Architecture

```
                +-------------------------------------------+
                |        React Frontend (:5173)             |
                |      Vite + React 19 + Axios              |
                +-------------------------------------------+
                                     |
                       OAuth2 Access Token (JWT via PKCE)
                                     v
                +-------------------------------------------+
                |         API Gateway (:8080)               |
                |  ✅ JWT validation via Keycloak JWKs      |
                |  ✅ Role-based route authorization        |
                |  ✅ Redis distributed rate limiting       |
                |  ✅ CORS filtering                        |
                |  ✅ Internal X-API-KEY injection          |
                +-------------------------------------------+
                         |            |             |
      X-API-KEY Header   |            |             |  X-API-KEY Header
                         v            v             v
        +------------------+  +-----------------+  +----------------------+
        | User/Auth (:8081)|  | Donation (:8082)|  | Blood Bank (:8083)   |
        |  Spring Boot     |  |  Spring Boot    |  |  Spring Boot         |
        +------------------+  +-----------------+  +----------------------+
                |                     |                      |
                v                     v                      v
        +---------------+     +----------------+     +-------------------+
        | MySQL: auth_db|     |MySQL:donation_db|    |MySQL:bloodbank_db |
        |    (:3307)    |     |     (:3308)    |     |      (:3309)      |
        +---------------+     +----------------+     +-------------------+

   +--------------------------+                 +------------------------+
   |    Keycloak (:8180)      |                 |     Redis (:6379)      |
   | Realm: blood-donation    |                 | Distributed Rate-Limit |
   +--------------------------+                 +------------------------+
```

---

## 🛡️ Security Architecture

### 1. Client → API Gateway
- Authentication via **Keycloak OAuth2 Authorization Code Flow with PKCE (`S256`)**.
- The React client attaches the JWT Bearer token in the `Authorization` header.
- The API Gateway verifies tokens against Keycloak's **JSON Web Key Set (JWKS)**.
- Roles (`ADMIN`, `DONOR`, `BLOOD_BANK`) are mapped to Spring Security authorities.

### 2. API Gateway → Microservices
- Microservices **reject all direct external requests** without a valid internal key.
- The Gateway **strips any client-provided `X-API-KEY`** and injects the verified internal secret.

### 3. Redis Rate Limiting
- Business API requests are throttled per client IP using a Redis sliding window.
- Default: **20 requests per 10-second window** → exceeding returns `HTTP 429 Too Many Requests`.

---

## 📋 Microservices & API Reference

### 1. User / Auth Service (Port `8081`)

- **Base Path**: `/api/users`
- **Swagger UI**: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- **Database**: `auth_db` (MySQL @ `localhost:3307`)
- **Direct API Key**: `auth-service-secret-key`

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Register a new user profile | Authenticated |
| `GET` | `/api/users` | Retrieve all user profiles | Authenticated |
| `GET` | `/api/users/{id}` | Retrieve a user profile by ID | Authenticated |
| `PUT` | `/api/users/{id}` | Update an existing user profile | Authenticated |
| `DELETE` | `/api/users/{id}` | Delete a user profile | `ADMIN` |

---

### 2. Donation Service (Port `8082`)

- **Base Path**: `/api/donations`
- **Swagger UI**: [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)
- **Database**: `donation_db` (MySQL @ `localhost:3308`)
- **Direct API Key**: `donation-service-secret-key`

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/donations` | Record a new donation availability | `DONOR`, `ADMIN` |
| `GET` | `/api/donations` | List all donation records | Authenticated |
| `GET` | `/api/donations/{id}` | Get donation record by ID | Authenticated |
| `GET` | `/api/donations/donor/{donorId}` | Find donations for a specific donor | Authenticated |
| `GET` | `/api/donations/blood-group/{bg}` | Filter donations by blood group | Authenticated |
| `GET` | `/api/donations/status/{status}` | Filter by status (`AVAILABLE`, `RESERVED`, `COMPLETED`, `CANCELLED`) | Authenticated |
| `GET` | `/api/donations/search` | Search by blood group & city | Authenticated |
| `PUT` | `/api/donations/{id}` | Update full donation record | `DONOR`, `ADMIN` |
| `PATCH` | `/api/donations/{id}/status` | Update donation status only | `DONOR`, `ADMIN` |
| `DELETE` | `/api/donations/{id}` | Delete a donation record | `DONOR`, `ADMIN` |

---

### 3. Blood Bank Service (Port `8083`)

- **Base Paths**: `/api/bloodbanks`, `/api/bloodstocks`, `/api/bloodrequests`
- **Swagger UI**: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)
- **Database**: `bloodbank_db` (MySQL @ `localhost:3309`)
- **Direct API Key**: `bloodbank-service-secret-key`

#### Blood Banks (`/api/bloodbanks`)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bloodbanks` | Register a new blood bank | `BLOOD_BANK`, `ADMIN` |
| `GET` | `/api/bloodbanks` | List all blood banks | Authenticated |
| `GET` | `/api/bloodbanks/{id}` | Get blood bank by ID | Authenticated |
| `PUT` | `/api/bloodbanks/{id}` | Update blood bank details | `BLOOD_BANK`, `ADMIN` |
| `DELETE` | `/api/bloodbanks/{id}` | Delete a blood bank | `BLOOD_BANK`, `ADMIN` |

#### Blood Stock (`/api/bloodstocks`)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bloodstocks` | Add stock units | `BLOOD_BANK`, `ADMIN` |
| `GET` | `/api/bloodstocks` | Get all inventory | Authenticated |
| `GET` | `/api/bloodstocks/{id}` | Get stock item by ID | Authenticated |
| `GET` | `/api/bloodstocks/blood-bank/{bankId}` | Get stock for a specific blood bank | Authenticated |
| `GET` | `/api/bloodstocks/blood-group/{bg}` | Get total stock for a blood group | Authenticated |
| `PUT` | `/api/bloodstocks/{id}` | Update stock item | `BLOOD_BANK`, `ADMIN` |
| `DELETE` | `/api/bloodstocks/{id}` | Delete stock item | `BLOOD_BANK`, `ADMIN` |

#### Blood Requests (`/api/bloodrequests`)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bloodrequests` | Submit request for blood units | `BLOOD_BANK`, `ADMIN` |
| `GET` | `/api/bloodrequests` | List all requests | Authenticated |
| `GET` | `/api/bloodrequests/{id}` | Get blood request by ID | Authenticated |
| `GET` | `/api/bloodrequests/blood-bank/{bankId}` | Get requests for a specific bank | Authenticated |
| `PUT` | `/api/bloodrequests/{id}` | Update request details | `BLOOD_BANK`, `ADMIN` |
| `PATCH` | `/api/bloodrequests/{id}/status` | Update status (`PENDING`, `APPROVED`, `REJECTED`, `FULFILLED`) | `BLOOD_BANK`, `ADMIN` |
| `DELETE` | `/api/bloodrequests/{id}` | Delete blood request | `BLOOD_BANK`, `ADMIN` |

---

## 🛠️ Tech Stack & Versions

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Language** | Java (Eclipse Temurin) | `21` |
| **Backend Framework** | Spring Boot | `4.0.7` |
| **API Gateway** | Spring Cloud Gateway | `2025.1.2` |
| **API Documentation** | Springdoc OpenAPI / Swagger UI | `3.0.3` |
| **Frontend** | React + Vite | `19` + `8` |
| **Identity Provider** | Keycloak (Quarkus) | `26.7.0` |
| **Databases** | MySQL (per-service) | `8.0` |
| **Cache / Rate Limiting** | Redis | `7.4` |
| **Containerization** | Docker & Docker Compose | Latest |

---

## 🏃 Running the Application

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/) installed

### Step 1 — Clone & Start the Stack

```powershell
# Clone the repository
git clone https://github.com/Lishani-Samarakoon/BloodDonationSystem-New.git
cd BloodDonationSystem-New

# Build and start all containers
docker compose up --build -d
```

> ⏳ First run takes ~3–5 minutes to download images and build services. Subsequent starts are faster.

### Step 2 — Access the Application

Open your browser and go to: **[http://localhost:5173](http://localhost:5173)**

Log in using any demo account:
- **Admin**: `admin1` / `admin123`
- **Donor**: `donor1` / `donor123`
- **Blood Bank**: `bank1` / `bank123`

### Step 3 — Stop the Application

```powershell
# Stop all containers (data is preserved)
docker compose down

# Stop and reset all databases (fresh start)
docker compose down -v
```

---

## 🧪 Automated Testing & Smoke Test Suite

Run the complete automated smoke test to verify all services, OAuth2 tokens, database CRUD, and rate limiting:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

### Coverage (23 Assertions)

| # | Test Category | What is Verified |
| :--- | :--- | :--- |
| 1–4 | **Health Checks** | Auth, Donation, Blood Bank & Gateway services are up |
| 5–6 | **Security — Direct Access** | Microservices reject requests without API key (`HTTP 401`) |
| 7–8 | **Security — Gateway Auth** | Gateway rejects requests without OAuth2 token (`HTTP 401`) |
| 9 | **Security — CORS** | Gateway preflight CORS validation passes |
| 10–11 | **OAuth2 Flow** | Keycloak token generation and verification |
| 12–14 | **User CRUD** | Create, read & delete user in `auth_db` |
| 15–18 | **Donation CRUD** | Validate, create, status-transition & delete donation in `donation_db` |
| 19–22 | **Blood Bank CRUD** | Blood bank, blood stock & request lifecycle in `bloodbank_db` |
| 23 | **Rate Limiting** | Redis enforces `HTTP 429` when threshold exceeded |

---

## 📁 Project Structure

```
BloodDonationSystem-New/
├── 📂 api-gateway/          # Spring Cloud Gateway — JWT validation, routing, rate limiting
├── 📂 auth-service/         # User & authentication microservice (port 8081)
├── 📂 donation-service/     # Donation management microservice (port 8082)
├── 📂 bloodbank-service/    # Blood bank, stock & request microservice (port 8083)
├── 📂 frontend/             # React 19 + Vite frontend (port 5173)
├── 📂 keycloak/             # Keycloak realm configuration & import files
├── 📂 scripts/              # PowerShell smoke-test scripts
├── 📄 docker-compose.yml    # Full stack orchestration
├── 📄 .env.example          # Environment variable template
├── 📄 TESTING_GUIDE.md      # Manual testing guide
├── 📄 FIXES_APPLIED.md      # Changelog of bug fixes applied
└── 📄 README.md             # This file
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ for the SOC Mini Project  
**[⬆ Back to Top](#-lifeline-network--blood-donation-management-system)**

</div>
