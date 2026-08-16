# Blood Donation Frontend

React/Vite client for the Blood Donation Management System.

## Local development

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

The client expects:

```text
API Gateway: http://localhost:8080
Keycloak:    http://localhost:8180
Realm:       blood-donation
Client ID:   blood-donation-frontend
```

Optional Vite environment variables:

```text
VITE_API_URL
VITE_KEYCLOAK_URL
VITE_KEYCLOAK_REALM
VITE_KEYCLOAK_CLIENT_ID
```

Authentication uses OAuth2/OpenID Connect Authorization Code with PKCE. API calls include the Bearer access token and are sent only through the API Gateway.
