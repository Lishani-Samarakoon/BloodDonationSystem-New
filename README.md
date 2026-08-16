# Blood Donation Management System

A **microservices-based Blood Donation Management System** developed using Spring Boot, React, Spring Cloud Gateway, Keycloak, Redis, Docker, and Docker Compose.

The system provides a centralized platform for managing users, blood donations, blood banks, blood stocks, and blood requests while applying authentication, API security, service routing, rate limiting, and containerized deployment.

---

## Team Members

| Member | Index Number | Main Contribution |
|---|---|---|
| Lishani Samarakoon | **ITBIN-2312-0005** | User/Auth & Security |
| Wathsala Kithulgala | **ITBIN-2312-0025** | Donation Management |
| Seshan Sandeepa | **ITBIN-2312-0024** | Blood Bank Management |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Objectives](#2-objectives)
3. [System Architecture](#3-system-architecture)
4. [Main Features](#4-main-features)
5. [Technologies Used](#5-technologies-used)
6. [Microservices](#6-microservices)
7. [Security](#7-security)
8. [Project Structure](#8-project-structure)
9. [Installation and Setup](#9-installation-and-setup)
10. [Running the System](#10-running-the-system)
11. [Testing](#11-testing)
12. [Team Contributions](#12-team-contributions)
13. [Git and GitHub Workflow](#13-git-and-github-workflow)
14. [Additional Documentation](#14-additional-documentation)
15. [Project Status](#15-project-status)
16. [License](#16-license)

---

# 1. Project Overview

The **Blood Donation Management System** is designed using a microservices architecture.

Instead of developing the entire system as one application, the main business functions are separated into independent backend services.

The main services are:

- User/Auth Service
- Donation Service
- Blood Bank Service
- API Gateway
- React Frontend
- Keycloak Authentication
- Redis-based rate limiting

The system allows users to securely manage blood donation-related activities while keeping each service independent and easier to maintain.

---

# 2. Objectives

The main objectives of the project are to:

- Develop a microservices-based blood donation management platform.
- Manage users securely.
- Manage blood donation records.
- Manage blood banks.
- Manage blood stocks.
- Manage blood requests.
- Apply authentication and authorization.
- Protect individual microservices using API keys.
- Provide a centralized API Gateway.
- Implement API rate limiting using Redis.
- Provide a user-friendly React frontend.
- Containerize the full system using Docker.
- Perform API and integration testing.
- Apply Git and GitHub collaboration using separate feature branches.

---

# 3. System Architecture

```text
                         ┌─────────────────────┐
                         │    React Frontend   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     API Gateway     │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐
        │  Auth Service  │ │Donation Service│ │ Blood Bank      │
        │                │ │                │ │ Service         │
        └────────────────┘ └────────────────┘ └─────────────────┘
                 │                  │                  │
                 └──────────────────┴──────────────────┘
                                    │
                     ┌──────────────┴─────────────┐
                     │                            │
                     ▼                            ▼
              ┌─────────────┐              ┌─────────────┐
              │  Keycloak   │              │    Redis    │
              │ Auth/Security│             │Rate Limiting│
              └─────────────┘              └─────────────┘
```

The API Gateway acts as the main entry point for frontend requests and routes each request to the correct backend microservice.

---

# 4. Main Features

## 4.1 User and Authentication Management

- Create users
- View users
- Update user information
- Delete users
- User validation
- Exception handling
- API-key protection
- Authentication using Keycloak
- OAuth2/JWT-based security

---

## 4.2 Donation Management

- Create blood donations
- View donation records
- Update donations
- Delete donations
- Search donations
- Search by donor
- Search by blood group
- Search by donation status
- Update donation status
- Quantity validation
- Date validation
- Exception handling
- API-key protection

---

## 4.3 Blood Bank Management

- Create blood banks
- View blood banks
- Update blood bank information
- Delete blood banks
- Manage blood stock
- Create blood stock records
- Update blood stock
- Delete blood stock
- Manage blood requests
- Create blood requests
- Update blood request status
- Delete blood requests
- Validation and exception handling

---

## 4.4 Frontend

The React frontend provides interfaces for:

- User authentication
- User management
- Donation management
- Blood Bank management
- Blood Stock management
- Blood Request management
- Status management
- Dashboard information

---

## 4.5 API Gateway

The API Gateway provides:

- Centralized access to backend services
- Service routing
- Authentication integration
- OAuth2/JWT handling
- API-key forwarding
- CORS configuration
- Redis-based rate limiting

---

# 5. Technologies Used

| Technology | Purpose |
|---|---|
| Java | Backend development |
| Spring Boot | Microservice development |
| Spring Cloud Gateway | API Gateway |
| React | Frontend development |
| Vite | Frontend development and build tool |
| Keycloak | Authentication and authorization |
| OAuth2 / JWT | Secure access |
| Redis | API rate limiting |
| Docker | Containerization |
| Docker Compose | Running multiple services together |
| Maven | Java dependency management |
| Swagger / OpenAPI | REST API documentation |
| Git | Version control |
| GitHub | Team collaboration |
| PowerShell | Automated smoke testing |

---

# 6. Microservices

## 6.1 Auth Service

The Auth Service manages user-related functionality.

### Main Responsibilities

- User entity management
- User CRUD REST APIs
- User validation
- Exception handling
- Service-specific API-key security
- Swagger/OpenAPI documentation

---

## 6.2 Donation Service

The Donation Service manages blood donation records.

### Main Responsibilities

- Donation creation
- Donation retrieval
- Donation updates
- Donation deletion
- Donation search
- Blood group filtering
- Donor filtering
- Status filtering
- Donation status management
- Quantity validation
- Date validation
- Exception handling
- Service-specific API-key security
- Swagger/OpenAPI documentation

---

## 6.3 Blood Bank Service

The Blood Bank Service manages Blood Bank operations.

### Main Responsibilities

- Blood Bank CRUD
- Blood Stock management
- Blood Request management
- Request status management
- Validation
- Exception handling
- Service-specific API-key security
- Swagger/OpenAPI documentation

---

## 6.4 API Gateway

The API Gateway provides a common entry point for communication between the frontend and backend services.

### Responsibilities

- Route requests to appropriate services
- Handle authentication-related access
- Forward service API keys
- Apply CORS configuration
- Apply Redis-based rate limiting

---

# 7. Security

The project uses multiple security mechanisms.

## 7.1 Keycloak

Keycloak is used for:

- User authentication
- Token generation
- OAuth2 integration
- JWT-based access control

The project contains Keycloak configuration under:

```text
keycloak/realm-config/
```

---

## 7.2 API-Key Security

Individual backend services are protected using service-specific API keys.

Protected requests use the header:

```text
X-API-KEY
```

This prevents unauthorized direct access to protected microservice endpoints.

---

## 7.3 API Gateway Security

The API Gateway provides centralized access to backend services and integrates the required authentication and routing rules.

---

## 7.4 CORS

CORS configuration allows the frontend and backend components to communicate correctly while controlling cross-origin requests.

---

## 7.5 Redis Rate Limiting

Redis is used to control excessive API requests through rate limiting.

This helps protect the application from request abuse and unnecessary traffic.

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
│
├── keycloak/
│   └── realm-config/
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

# 9. Installation and Setup

## 9.1 Prerequisites

Install the following software before running the project:

- Git
- Java JDK 21
- Maven
- Node.js
- Docker Desktop

---

## 9.2 Clone the Repository

```bash
git clone https://github.com/Lishani-Samarakoon/BloodDonationSystem-New.git
```

Move into the project:

```bash
cd BloodDonationSystem-New
```

---

## 9.3 Environment Configuration

The repository contains:

```text
.env.example
```

This file provides an example of the environment variables required by the project.

Create the required local environment configuration based on this file.

> Do not commit real passwords, tokens, API keys, or private credentials to GitHub.

---

# 10. Running the System

The easiest way to run the complete application is through Docker Compose.

## Start the System

From the project root directory:

```bash
docker compose up --build
```

Docker will build and start the required application containers.

---

## Stop the System

```bash
docker compose down
```

---

## Rebuild After Code Changes

```bash
docker compose up --build
```

---

## Check Running Containers

```bash
docker compose ps
```

The effective service ports and container configuration can be reviewed in:

```text
docker-compose.yml
```

---

# 11. Testing

The project includes integration/smoke testing through:

```text
scripts/smoke-test.ps1
```

Make sure Docker Compose is already running before starting the test.

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

The smoke test checks important operations such as:

- Service availability
- API-key security
- Authentication-related functionality
- User operations
- Donation creation
- Donation retrieval
- Invalid donation validation
- Unknown donation handling
- Blood Bank creation
- Blood Stock creation
- Blood Request creation
- Donation status updates
- Blood Request status updates
- Redis rate limiting
- Delete operations
- Service integration

A successful execution displays:

```text
All smoke tests passed successfully.
```

---

# 12. Team Contributions

The project was completed by three members using separate Git branches and Pull Requests.

---

## Member 1 – Lishani Samarakoon

**Index Number:** `ITBIN-2312-0005`  
**GitHub:** `Lishani-Samarakoon`  
**Branch:** `feature/user-auth-security`

### Main Contribution: User/Auth & Security

- User/Auth Service
- User entity implementation
- User CRUD REST APIs
- User validation
- Exception handling
- Service-specific API-key security
- Swagger/OpenAPI documentation
- Keycloak realm configuration
- User/Auth API testing
- Security-related backend functionality

---

## Member 2 – Wathsala Kithulgala

**Index Number:** `ITBIN-2312-0025`  
**GitHub:** `wathsala2001`  
**Branch:** `feature/donation-management`

### Main Contribution: Donation Management

- Donation entity implementation
- Donation CRUD REST APIs
- Donation search functionality
- Search by donor
- Search by blood group
- Search by donation status
- Donation status management
- Quantity validation
- Date validation
- Exception handling
- Service-specific API-key security
- Swagger/OpenAPI documentation
- Donation API testing
- Donation integration testing

---

## Member 3 – Seshan Sandeepa

**Index Number:** `ITBIN-2312-0024`  
**GitHub:** `seshansandeepa`  
**Branch:** `feature/bloodbank-infrastructure`

### Main Contribution: Blood Bank Management

- Blood Bank entity implementation
- Blood Bank CRUD REST APIs
- Blood Stock management
- Blood Stock operations
- Blood Request management
- Blood Request status management
- Validation
- Exception handling
- Service-specific API-key security
- Swagger/OpenAPI documentation
- Blood Bank API testing
- Blood Bank integration testing

---

## Shared Group Integration

The following components were integrated as shared group work:

- React frontend
- API Gateway
- Service routing
- OAuth2/JWT integration
- CORS configuration
- Service API-key forwarding
- Docker Compose
- Redis configuration
- Rate limiting
- Integration testing
- Smoke testing
- Final documentation

The final integration was completed using:

```text
integration/final-project
```

---

# 13. Git and GitHub Workflow

The team used separate Git feature branches to maintain clear individual contribution records.

| Member / Purpose | Branch |
|---|---|
| Lishani – User/Auth & Security | `feature/user-auth-security` |
| Wathsala – Donation Management | `feature/donation-management` |
| Seshan – Blood Bank Management | `feature/bloodbank-infrastructure` |
| Final Group Integration | `integration/final-project` |

The development workflow was:

```text
Individual Development
        ↓
Feature Branch
        ↓
Commit
        ↓
Push to GitHub
        ↓
Pull Request
        ↓
Review / Merge
        ↓
Main Branch
        ↓
Final Group Integration
```

This workflow allows individual contributions to remain visible through GitHub commits and Pull Requests.

---

# 14. Additional Documentation

Additional project documentation is available in the repository.

## Testing Guide

```text
TESTING_GUIDE.md
```

Contains information about project testing.

---

## Team Git Guide

```text
TEAM_GIT_GUIDE.md
```

Contains information about the team Git/GitHub workflow.

---

## Fixes Applied

```text
FIXES_APPLIED.md
```

Documents important fixes and improvements made during development.

---

## Environment Example

```text
.env.example
```

Provides example environment configuration without exposing private credentials.

---

# 15. Project Status

| Component | Status |
|---|---|
| User/Auth Service |  Complete |
| Donation Service | Complete |
| Blood Bank Service | Complete |
| Blood Stock Management | Complete |
| Blood Request Management | Complete |
| API Gateway | Complete |
| React Frontend | Complete |
| Keycloak Integration | Complete |
| OAuth2/JWT Integration | Complete |
| Service API-key Security | Complete |
| Redis Rate Limiting | Complete |
| Docker Compose Integration | Complete |
| Swagger/OpenAPI | Complete |
| API Testing | Complete |
| Smoke Testing | Complete |
| GitHub Team Integration | Complete |

---

# 16. License

This project is licensed under the **MIT License**.

See the following file for details:

```text
LICENSE
```

---

## Final Project

**Blood Donation Management System**

Developed collaboratively using:

**Spring Boot • React • API Gateway • Keycloak • Redis • Docker • Git • GitHub**
