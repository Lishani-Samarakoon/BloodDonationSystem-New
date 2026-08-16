import { getValidAccessToken } from './auth'

const GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function apiFetch(path, options = {}) {
  const token = await getValidAccessToken()
  if (!token) throw new Error('Your login session has expired. Please sign in again.')

  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Accept', 'application/json')

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${GATEWAY_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.error || Object.values(payload || {}).join(', ') || `Request failed with HTTP ${response.status}`
    throw new Error(message)
  }

  return payload
}

export function getGatewayUrl() {
  return GATEWAY_URL
}
