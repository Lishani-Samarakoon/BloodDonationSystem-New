# Fixes Applied to the Blood Donation Management System

This version corrects the main technical gaps found in the original project.

## Backend microservices

- Fixed API-key authentication so a valid `X-API-KEY` creates an authenticated Spring Security context.
- Swagger/OpenAPI and health endpoints are public while business APIs remain API-key protected.
- Added missing Auth Service OpenAPI security configuration.
- Updated Springdoc OpenAPI from the Spring Boot 3 line to `3.0.3`, which supports Spring Boot 4.
- Added Actuator health endpoints.
- Added H2 test configuration so basic Spring context tests do not require MySQL.
- Standardized environment-variable configuration for database credentials and API keys.
- Added valid blood-group validation.
- Added positive donation quantity validation.
- Added `@FutureOrPresent` validation to donation availability dates.
- Added missing `@NotNull` validation to blood stock/request quantities.

## Blood Bank Service

- Added Blood Bank DELETE endpoint.
- Added Blood Stock GET-by-ID endpoint.
- Added Blood Stock GET-by-blood-bank endpoint.
- Added Blood Stock DELETE endpoint.
- Added Blood Request GET-by-ID endpoint.
- Added Blood Request GET-by-blood-bank endpoint.
- Added Blood Request PUT endpoint.
- Added Blood Request DELETE endpoint.
- Added JSON request DTO for blood-request status updates.
- Added checks that referenced `bloodBankId` values exist before creating/updating stock and requests.

## API Gateway

- Kept Spring Boot `4.0.7` with Spring Cloud `2025.1.2`.
- Added Blood Bank Docker route URL/API-key environment variables.
- Replaced the in-memory `ConcurrentHashMap` limiter with Redis-backed rate limiting.
- Added Redis configuration and rate-limit response headers.
- Added Keycloak realm-role conversion for `DONOR`, `BLOOD_BANK`, and `ADMIN`.
- Added role-based authorization rules for write/delete operations.
- Added external issuer + internal JWK URL configuration so Docker-hosted Gateway can validate browser-issued Keycloak tokens.
- Kept Gateway-side CORS for `http://localhost:5173`.

## OAuth2 / Keycloak

- Frontend client uses Authorization Code + PKCE (S256).
- Added explicit default role/profile/email client scopes.
- Kept demo users for DONOR, BLOOD_BANK, and ADMIN roles.
- Added a separate local test client for the automated PowerShell smoke test.
- Pinned Keycloak Docker image to `26.7.0` instead of `latest`.

## Frontend

- Replaced hard-coded dashboard statistics with live Gateway API data.
- Added Keycloak login/logout with PKCE without adding another frontend dependency.
- Added token storage and refresh handling.
- Added authenticated API helper that sends Bearer tokens to the Gateway.
- Added live user, donation, blood bank, blood stock, and blood request screens.
- Added create/list/delete/status-management actions.
- Added role-aware UI controls.
- Added responsive layout and error/success messages.
- Changed Docker frontend delivery from the Vite development server to a production Nginx image.

## Docker / infrastructure

- Added Redis container and health check.
- Added missing Gateway Blood Bank environment configuration.
- Replaced Java JRE-only build images with multi-stage JDK-build + JRE-runtime Dockerfiles.
- Added `.dockerignore` files.
- Added optional `.env.example` overrides and ignored `.env` in Git.
- Removed reliance on Spring Boot's automatic Docker Compose support from Donation Service.

## Testing

- Added `TESTING_GUIDE.md`.
- Added `scripts/smoke-test.ps1` to test health, API keys, OAuth2, CORS, CRUD, validation, 404 responses, status updates, Redis 429 rate limiting, and cleanup.

## Still requires the team to do manually

The following cannot be truthfully automated inside a replacement ZIP:

1. Run `docker compose up --build` on a machine with Docker and internet access.
2. Run `scripts/smoke-test.ps1` and confirm all results are PASS.
3. Capture the real screenshots for the report.
4. Each team member must make/push their own genuine Git commits from their own GitHub account. Do not create fake contribution history.
5. Update the final report only with test results that were actually observed.
