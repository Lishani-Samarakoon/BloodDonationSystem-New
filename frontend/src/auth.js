const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180'
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'blood-donation'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'blood-donation-frontend'
const STORAGE_KEY = 'blood-donation-auth-session'
const PKCE_KEY = 'blood-donation-pkce'

const realmUrl = `${KEYCLOAK_URL}/realms/${REALM}`
const tokenEndpoint = `${realmUrl}/protocol/openid-connect/token`

function base64Url(bytes) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomValue(size = 48) {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return base64Url(bytes)
}

async function codeChallenge(verifier) {
  const encoded = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return base64Url(new Uint8Array(digest))
}

function decodeJwt(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')
    return JSON.parse(decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    ))
  } catch {
    return null
  }
}

function saveTokens(tokens) {
  const access = decodeJwt(tokens.access_token)
  const expiresAt = access?.exp ? access.exp * 1000 : Date.now() + ((tokens.expires_in || 300) * 1000)
  const saved = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiresAt,
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  return saved
}

function readStoredTokens() {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function makeSession(tokens) {
  if (!tokens?.accessToken) return null
  const claims = decodeJwt(tokens.accessToken) || {}
  return {
    ...tokens,
    username: claims.preferred_username || claims.name || 'User',
    name: claims.name || claims.preferred_username || 'User',
    email: claims.email || '',
    roles: claims.realm_access?.roles || [],
    claims,
  }
}

async function exchangeCode(code, verifier, redirectUri) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  })

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    throw new Error('Keycloak login could not be completed.')
  }

  return response.json()
}

async function refreshStoredTokens(tokens) {
  if (!tokens?.refreshToken) return null

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    refresh_token: tokens.refreshToken,
  })

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    clearAuth()
    return null
  }

  return saveTokens(await response.json())
}

export async function login() {
  const verifier = randomValue(64)
  const state = randomValue(32)
  const challenge = await codeChallenge(verifier)
  const redirectUri = `${window.location.origin}${window.location.pathname}`

  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state, redirectUri }))

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: redirectUri,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.assign(`${realmUrl}/protocol/openid-connect/auth?${params.toString()}`)
}

export async function initAuth() {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')

  if (code) {
    const pkceRaw = sessionStorage.getItem(PKCE_KEY)
    if (!pkceRaw) throw new Error('Login session information is missing. Please sign in again.')

    const pkce = JSON.parse(pkceRaw)
    if (!returnedState || returnedState !== pkce.state) {
      throw new Error('Login state validation failed. Please sign in again.')
    }

    const saved = saveTokens(await exchangeCode(code, pkce.verifier, pkce.redirectUri))
    sessionStorage.removeItem(PKCE_KEY)
    window.history.replaceState({}, document.title, pkce.redirectUri)
    return makeSession(saved)
  }

  let saved = readStoredTokens()
  if (!saved) return null

  if (saved.expiresAt - Date.now() < 30_000) {
    saved = await refreshStoredTokens(saved)
  }

  return makeSession(saved)
}

export async function getValidAccessToken() {
  let saved = readStoredTokens()
  if (!saved) return null

  if (saved.expiresAt - Date.now() < 30_000) {
    saved = await refreshStoredTokens(saved)
  }

  return saved?.accessToken || null
}

export function getCurrentSession() {
  return makeSession(readStoredTokens())
}

export function hasRole(session, role) {
  return Boolean(session?.roles?.includes(role))
}

export function clearAuth() {
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(PKCE_KEY)
}

export function logout() {
  const tokens = readStoredTokens()
  const redirectUri = `${window.location.origin}${window.location.pathname}`
  clearAuth()

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    post_logout_redirect_uri: redirectUri,
  })
  if (tokens?.idToken) params.set('id_token_hint', tokens.idToken)

  window.location.assign(`${realmUrl}/protocol/openid-connect/logout?${params.toString()}`)
}
