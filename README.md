# Blood Donation Management System

A Service-Oriented Computing group project implemented with Spring Boot microservices, a Spring Cloud API Gateway, Keycloak OAuth2/OpenID Connect, Redis rate limiting, MySQL databases, React, Swagger/OpenAPI, Docker, and Docker Compose.

## Architecture

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
  - internal API-key injection
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

The frontend never sends a service API key. It authenticates with Keycloak and sends an OAuth2 access token to the Gateway. The Gateway validates the token, applies authorization/rate limiting, removes any client-supplied `X-API-KEY`, adds the correct internal service key, and forwards the request.

## Main components

### User/Auth Service — port 8081

Manages application user profiles.

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`
- MySQL database: `auth_db`
- Internal key header: `X-API-KEY`
- Swagger: `http://localhost:8081/swagger-ui.html`

### Donation Service — port 8082

Manages donor availability and donation records.

- `POST /api/donations`
- `GET /api/donations`
- `GET /api/donations/{id}`
- `GET /api/donations/donor/{donorId}`
- `GET /api/donations/blood-group/{bloodGroup}`
- `GET /api/donations/status/{status}`
- `GET /api/donations/search`
- `PUT /api/donations/{id}`
- `PATCH /api/donations/{id}/status`
- `DELETE /api/donations/{id}`
- MySQL database: `donation_db`
- Swagger: `http://localhost:8082/swagger-ui.html`

Donation validation includes a valid blood group, positive quantity, and an availability date that is today or later.

### Blood Bank Service — port 8083

Manages blood banks, blood stock, and blood requests.

Blood banks:

- `POST /api/bloodbanks`
- `GET /api/bloodbanks`
- `GET /api/bloodbanks/{id}`
- `PUT /api/bloodbanks/{id}`
- `DELETE /api/bloodbanks/{id}`

Blood stock:

- `POST /api/bloodstocks`
- `GET /api/bloodstocks`
- `GET /api/bloodstocks/{id}`
- `GET /api/bloodstocks/blood-bank/{bloodBankId}`
- `GET /api/bloodstocks/blood-group/{bloodGroup}`
- `PUT /api/bloodstocks/{id}`
- `DELETE /api/bloodstocks/{id}`

Blood requests:

- `POST /api/bloodrequests`
- `GET /api/bloodrequests`
- `GET /api/bloodrequests/{id}`
- `GET /api/bloodrequests/blood-bank/{bloodBankId}`
- `PUT /api/bloodrequests/{id}`
- `PATCH /api/bloodrequests/{id}/status`
- `DELETE /api/bloodrequests/{id}`

MySQL database: `bloodbank_db`

Swagger: `http://localhost:8083/swagger-ui.html`

## API Gateway security

Gateway URL: `http://localhost:8080`

### Authentication

Protected `/api/**` requests require a JWT access token issued by the `blood-donation` Keycloak realm.

```text
Authorization: Bearer <access-token>
```

### Role-based authorization

Keycloak realm roles are mapped to Spring Security roles.

- `DONOR` or `ADMIN`: create/update/delete donations
- `BLOOD_BANK` or `ADMIN`: create/update/delete blood banks, stock, and blood requests
- `ADMIN`: delete user profiles
- Authenticated users can read the system data required by the client

### Internal service API keys

Each microservice has a separate internal key. The Gateway injects the correct key automatically.

For direct Swagger/manual service testing only:

```text
Auth:       auth-service-secret-key
Donation:   donation-service-secret-key
Blood Bank: bloodbank-service-secret-key
```

These are local development defaults. They can be changed with environment variables or a local `.env` file.

### CORS

The Gateway allows the React client origin:

```text
http://localhost:5173
```

### Redis rate limiting

Business API requests are limited per client IP using Redis.

Default development values:

```text
20 requests / 10 seconds
```

Requests above the limit receive:

```text
HTTP 429 Too Many Requests
```

## Keycloak

Realm:

```text
blood-donation
```

Frontend client:

```text
blood-donation-frontend
```

The browser login uses the OAuth2 Authorization Code flow with PKCE (S256).

Demo users:

| Role | Username | Password |
| --- | --- | --- |
| Donor | `donor1` | `donor123` |
| Blood Bank | `bank1` | `bank123` |
| Admin | `admin1` | `admin123` |

Keycloak admin console:

```text
http://localhost:8180
```

Default local admin:

```text
admin / admin123
```

A second client named `blood-donation-test-client` enables the local automated smoke-test script to obtain a test token. It is for local assignment testing only and is not used by the frontend.

## Frontend

Frontend URL:

```text
http://localhost:5173
```

The frontend now uses real Gateway APIs rather than hard-coded dashboard values. It includes:

- Keycloak login/logout
- OAuth2 token handling and refresh
- Live dashboard metrics
- User profile creation/listing
- Donation creation/listing/status management/deletion
- Blood bank creation/listing/deletion
- Blood stock creation/listing/deletion
- Blood request creation/listing/status management/deletion
- Role-aware controls

## Run the complete project with Docker

### Prerequisites

- Docker Desktop
- Git

From the project root:

```powershell
docker compose up --build
```

The stack contains:

- `mysql-auth`
- `mysql-donation`
- `mysql-bloodbank`
- `redis`
- `keycloak`
- `auth-service`
- `donation-service`
- `bloodbank-service`
- `api-gateway`
- `frontend`

After startup, open:

```text
http://localhost:5173
```

To stop the project:

```powershell
docker compose down
```

To also remove database volumes and start with empty databases:

```powershell
docker compose down -v
```

## Optional environment configuration

Copy:

```text
.env.example
```

to:

```text
.env
```

and change the local database passwords/API keys if required. `.env` is ignored by Git.

## Automated smoke testing

After the Docker stack is running, open a second PowerShell window in the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

The script checks authentication, API-key protection, CRUD operations, validation, 404 handling, CORS, status updates, Redis rate limiting, and cleanup.

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for the complete test procedure and report screenshot checklist.

## Technology versions

- Java 21
- Spring Boot 4.0.7
- Spring Cloud 2025.1.2
- Springdoc OpenAPI 3.0.3
- React 19
- Vite 8
- MySQL 8
- Redis 7.4
- Keycloak 26.7.0

## Notes for the assignment

- Each microservice owns its own database.
- Donation Service stores `donorId` instead of creating a JPA relationship to User/Auth Service data.
- Blood Stock and Blood Request use `bloodBankId` within the Blood Bank Service and validate that the referenced blood bank exists.
- OAuth2 protects `Client -> Gateway` communication.
- Service API keys protect `Gateway -> Microservice` communication.
- Redis provides distributed rate-limit counters rather than a single in-memory map.
- Dockerfiles use multi-stage builds: JDK for compilation and JRE for the final Java runtime image.

Do not claim a test passed in the final report until it has been run successfully on the team's machine and the evidence has been captured.
