const API_URL = (import.meta.env.VITE_API_URL || 'https://hng-14-stage-1.vercel.app').replace(/\/$/, '')

function getCsrfToken() {
  const match = document.cookie.split('; ').find(r => r.startsWith('csrf_token='))
  return match ? match.split('=')[1] : null
}

let _refreshing = null

async function _tryRefresh() {
  if (_refreshing) return _refreshing
  _refreshing = fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
    .then(r => r.ok)
    .catch(() => false)
    .finally(() => { _refreshing = null })
  return _refreshing
}

export async function apiFetch(method, path, { body, params } = {}) {
  const url = new URL(`${API_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.set(k, v)
    })
  }

  const headers = { 'X-API-Version': '1' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const mutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())
  if (mutating) {
    const csrf = getCsrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf
  }

  let resp = await fetch(url.toString(), {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (resp.status === 401) {
    const ok = await _tryRefresh()
    if (ok) {
      resp = await fetch(url.toString(), {
        method,
        headers,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    }
    if (resp.status === 401) {
      window.location.href = '/login?error=session_expired'
      return null
    }
  }

  return resp
}

export const get    = (path, opts)  => apiFetch('GET',    path, opts)
export const post   = (path, body)  => apiFetch('POST',   path, { body })
export const del    = (path)        => apiFetch('DELETE',  path)
