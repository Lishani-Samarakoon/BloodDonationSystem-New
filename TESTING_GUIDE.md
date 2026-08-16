# Testing Guide

## 1. Start the complete system

From the project root:

```powershell
docker compose up --build
```

Wait until MySQL, Keycloak, Redis, the three microservices, the API Gateway, and the frontend are running.

## 2. Run the automated smoke test on Windows

Open a second PowerShell window in the project root and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

The script checks:

- All service health endpoints
- 401 when a microservice is called without its API key
- 401 when the Gateway is called without OAuth2
- CORS preflight
- User creation
- Donation creation
- Validation (negative quantity -> 400)
- 404 handling
- Blood bank creation
- Blood stock creation
- Blood request creation
- Donation and request status updates
- Redis rate limiting (HTTP 429)
- DELETE endpoints and cleanup

## 3. Manual browser tests

Frontend:

```text
http://localhost:5173
```

Keycloak admin console:

```text
http://localhost:8180
```

Keycloak admin login:

```text
admin / admin123
```

Demo application users:

```text
Donor:      donor1 / donor123
Blood Bank: bank1 / bank123
Admin:      admin1 / admin123
```

## 4. Swagger UI

```text
User/Auth:  http://localhost:8081/swagger-ui.html
Donation:   http://localhost:8082/swagger-ui.html
Blood Bank: http://localhost:8083/swagger-ui.html
```

Use the **Authorize** button and enter the service's local development API key:

```text
Auth:       auth-service-secret-key
Donation:   donation-service-secret-key
Blood Bank: bloodbank-service-secret-key
```

## 5. Screenshots to collect for the report

Capture evidence only after the test succeeds:

- Keycloak login page
- Frontend dashboard after login
- User profile creation
- Donation creation and list
- Blood bank creation
- Blood stock page
- Blood request page
- Swagger UI for all three services
- 401 without API key
- 401 from Gateway without OAuth token
- Successful Gateway request with Bearer token
- 400 validation error
- 404 not found result
- 429 rate-limit result
- `docker compose ps` showing all containers
- GitHub commit history from all three members
