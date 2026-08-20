# 🩸 Blood Donation Management System (LifeLine Network)

A production-grade, microservice-based **Blood Donation Management System** developed with **Spring Boot**, **Spring Cloud API Gateway**, **Keycloak OAuth2 / OpenID Connect**, **Redis Rate Limiting**, **MySQL**, **React (Vite)**, **Docker**, and **Swagger / OpenAPI 3**.

---

## 🚀 Quick Access Links

When the Docker Compose stack is running locally, access all components using these links:

| Component | URL | Credentials / Notes |
| :--- | :--- | :--- |
| 🌐 **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Single Page React Application |
| 🚪 **API Gateway** | [http://localhost:8080](http://localhost:8080) | OAuth2 Bearer Token Protected |
| 🔐 **Keycloak Admin Console** | [http://localhost:8180](http://localhost:8180) | `admin` / `admin` (Realm: `blood-donation`) |
| 👤 **User/Auth Service Swagger** | [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html) | API Key: `auth-service-secret-key` |
| 🩸 **Donation Service Swagger** | [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html) | API Key: `donation-service-secret-key` |
| 🏥 **Blood Bank Service Swagger** | [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html) | API Key: `bloodbank-service-secret-key` |
| 💓 **Gateway Health Check** | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) | Liveness & Readiness endpoints |

---

## 👥 Demo User Accounts

The system includes pre-configured Keycloak users mapped to specific realm roles:

| Role | Username | Password | Realm Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **System Admin** | `admin1` | `admin123` | Full administrative access: manage users, donations, blood banks, stock, and requests |
| 🩸 **Blood Donor** | `donor1` | `donor123` | Create/manage personal donor profile & donation records |
| 🏥 **Blood Bank** | `bank1` | `bank123` | Create/manage blood banks, blood stocks, and blood requests |

---

## 🏛️ System Architecture

```text
               +-------------------------------------------+
               |        React Frontend (:5173)             |
               +-------------------------------------------+
                                     |
                       OAuth2 Access Token (JWT)
                                     v
               +-------------------------------------------+
               |         API Gateway (:8080)               |
               |  - JWT validation via Keycloak JWKs       |
               |  - Role-based route authorization         |
               |  - Redis distributed rate limiting        |
               |  - CORS filtering                         |
               |  - Internal X-API-KEY injection           |
               +-------------------------------------------+
                        |            |             |
      X-API-KEY Header  |            |             |  X-API-KEY Header
                        v            v             v
       +------------------+  +-----------------+  +----------------------+
       | User/Auth (:8081)|  | Donation (:8082)|  | Blood Bank (:8083)   |
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

1. **Client &rarr; API Gateway Communication**:
   - Authentication is handled via Keycloak using **OAuth2 Authorization Code Flow with PKCE (`S256`)**.
   - The React client sends the OAuth2 Bearer token in the `Authorization` header.
   - The API Gateway verifies the JWT against Keycloak's JSON Web Key Set (JWKS).
   - Keycloak realm roles (`ADMIN`, `DONOR`, `BLOOD_BANK`) are mapped to Spring Security authorities.

2. **API Gateway &rarr; Microservices Communication**:
   - Microservices are isolated and reject direct external requests that lack the valid internal service key (`X-API-KEY`).
   - The Gateway strips any client-provided `X-API-KEY` and injects the verified internal secret key before forwarding traffic.

3. **Redis Rate Limiting**:
   - Business API requests are throttled per client IP using Redis.
   - Default threshold: **20 requests per 10-second sliding window**. Requests exceeding the limit receive `HTTP 429 Too Many Requests`.

---

## 📋 Microservices & API Reference

### 1. User / Auth Service (Port `8081` / Database: `auth_db`)
- **Base Path**: `/api/users`
- **Swagger Documentation**: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- **Direct API Key**: `auth-service-secret-key`

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Register a new user profile | Authenticated |
| `GET` | `/api/users` | Retrieve all user profiles | Authenticated |
| `GET` | `/api/users/{id}` | Retrieve a user profile by ID | Authenticated |
| `PUT` | `/api/users/{id}` | Update an existing user profile | Authenticated |
| `DELETE` | `/api/users/{id}` | Delete a user profile | `ADMIN` |

---

### 2. Donation Service (Port `8082` / Database: `donation_db`)
- **Base Path**: `/api/donations`
- **Swagger Documentation**: [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)
- **Direct API Key**: `donation-service-secret-key`

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/donations` | Record a new donation availability | `DONOR`, `ADMIN` |
| `GET` | `/api/donations` | List all donation records | Authenticated |
| `GET` | `/api/donations/{id}` | Get donation record by ID | Authenticated |
| `GET` | `/api/donations/donor/{donorId}` | Find donations for a specific donor | Authenticated |
| `GET` | `/api/donations/blood-group/{bg}` | Filter donations by blood group | Authenticated |
| `GET` | `/api/donations/status/{status}` | Filter by status (`AVAILABLE`, `RESERVED`, `COMPLETED`, `CANCELLED`) | Authenticated |
| `GET` | `/api/donations/search` | Search donations by blood group & city | Authenticated |
| `PUT` | `/api/donations/{id}` | Update full donation record | `DONOR`, `ADMIN` |
| `PATCH` | `/api/donations/{id}/status` | Update donation status | `DONOR`, `ADMIN` |
| `DELETE` | `/api/donations/{id}` | Delete a donation record | `DONOR`, `ADMIN` |

---

### 3. Blood Bank Service (Port `8083` / Database: `bloodbank_db`)
- **Base Paths**: `/api/bloodbanks`, `/api/bloodstocks`, `/api/bloodrequests`
- **Swagger Documentation**: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)
- **Direct API Key**: `bloodbank-service-secret-key`

| Resource | Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| **Blood Banks** | `POST` | `/api/bloodbanks` | Register a new blood bank | `BLOOD_BANK`, `ADMIN` |
| | `GET` | `/api/bloodbanks` | List all blood banks | Authenticated |
| | `GET` | `/api/bloodbanks/{id}` | Get blood bank by ID | Authenticated |
| | `PUT` | `/api/bloodbanks/{id}` | Update blood bank details | `BLOOD_BANK`, `ADMIN` |
| | `DELETE` | `/api/bloodbanks/{id}` | Delete blood bank | `BLOOD_BANK`, `ADMIN` |
| **Blood Stock** | `POST` | `/api/bloodstocks` | Add stock units | `BLOOD_BANK`, `ADMIN` |
| | `GET` | `/api/bloodstocks` | Get inventory across all banks | Authenticated |
| | `GET` | `/api/bloodstocks/{id}` | Get stock item by ID | Authenticated |
| | `GET` | `/api/bloodstocks/blood-bank/{bankId}` | Get stock for a specific blood bank | Authenticated |
| | `GET` | `/api/bloodstocks/blood-group/{bg}` | Get total stock for a blood group | Authenticated |
| | `PUT` | `/api/bloodstocks/{id}` | Update stock item | `BLOOD_BANK`, `ADMIN` |
| | `DELETE` | `/api/bloodstocks/{id}` | Delete stock item | `BLOOD_BANK`, `ADMIN` |
| **Blood Requests** | `POST` | `/api/bloodrequests` | Submit request for blood units | `BLOOD_BANK`, `ADMIN` |
| | `GET` | `/api/bloodrequests` | List all requests | Authenticated |
| | `GET` | `/api/bloodrequests/{id}` | Get blood request by ID | Authenticated |
| | `GET` | `/api/bloodrequests/blood-bank/{bankId}` | Get requests for a specific bank | Authenticated |
| | `PUT` | `/api/bloodrequests/{id}` | Update request details | `BLOOD_BANK`, `ADMIN` |
| | `PATCH` | `/api/bloodrequests/{id}/status` | Update request status (`PENDING`, `APPROVED`, `REJECTED`, `FULFILLED`) | `BLOOD_BANK`, `ADMIN` |
| | `DELETE` | `/api/bloodrequests/{id}` | Delete blood request | `BLOOD_BANK`, `ADMIN` |

---

## 🛠️ Tech Stack & Versions

- **Java**: `21` (Eclipse Temurin)
- **Spring Boot**: `4.0.7`
- **Spring Cloud**: `2025.1.2`
- **Springdoc OpenAPI / Swagger**: `3.0.3`
- **React**: `19` + **Vite**: `8`
- **Identity Provider**: **Keycloak** `26.7.0` (Quarkus)
- **Databases**: **MySQL** `8.0` (Database-per-Service pattern)
- **Caching & Rate Limiting**: **Redis** `7.4`
- **Containerization**: **Docker** & **Docker Compose**

---

## 🏃 Running the Application

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone and Start Stack
```powershell
# Clone the repository
git clone https://github.com/Lishani-Samarakoon/BloodDonationSystem-New.git
cd BloodDonationSystem-New

# Start all containers (databases, Keycloak, Redis, microservices, frontend)
docker compose up --build -d
```

### 2. Access the Application
- Open **[http://localhost:5173](http://localhost:5173)**
- Log in with `admin1` / `admin123`, `donor1` / `donor123`, or `bank1` / `bank123`.

### 3. Stop the Application
```powershell
# Stop containers
docker compose down

# To also reset databases and start fresh:
docker compose down -v
```

---

## 🧪 Automated Testing & Smoke Test Suite

To run the complete automated smoke test suite verifying all services, OAuth2 tokens, database CRUD operations, and rate limiting:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

### Smoke Test Coverage (23 Assertions):
- [x] Service health checks (Auth, Donation, Blood Bank, Gateway)
- [x] Microservice direct access rejection without API key (`HTTP 401`)
- [x] Gateway request rejection without OAuth2 token (`HTTP 401`)
- [x] Gateway CORS preflight validation
- [x] Keycloak OAuth2 token generation and verification
- [x] User creation, reading, and deletion in `auth_db`
- [x] Donation validation, creation, status transition, and deletion in `donation_db`
- [x] Blood bank, blood stock, and blood request lifecycle in `bloodbank_db`
- [x] Distributed Redis rate-limiting enforcement (`HTTP 429`)
