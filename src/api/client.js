const API_URL = (import.meta.env.VITE_API_URL || 'https://hng-14-stage-1.vercel.app').replace(/\/$/, '')

const CSRF_KEY = 'csrf_token'

function readCachedCsrf() {
  try { return sessionStorage.getItem(CSRF_KEY) } catch { return null }
}

function writeCachedCsrf(token) {
  try {
    if (token) sessionStorage.setItem(CSRF_KEY, token)
    else sessionStorage.removeItem(CSRF_KEY)
  } catch { /* ignore */ }
}

let _csrfFetching = null
async function fetchCsrf() {
  if (_csrfFetching) return _csrfFetching
  _csrfFetching = fetch(`${API_URL}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'X-API-Version': '1' },
  })
    .then(async r => {
      if (!r.ok) return null
      const data = await r.json().catch(() => null)
      const token = data && data.csrf_token
      if (token) writeCachedCsrf(token)
      return token
    })
    .catch(() => null)
    .finally(() => { _csrfFetching = null })
  return _csrfFetching
}

export function clearCsrf() {
  writeCachedCsrf(null)
}

let _refreshing = null

async function _tryRefresh() {
  if (_refreshing) return _refreshing
  _refreshing = fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-API-Version': '1' },
    body: JSON.stringify({}),
  })
    .then(async r => {
      if (!r.ok) return false
      const data = await r.json().catch(() => null)
      if (data && data.csrf_token) writeCachedCsrf(data.csrf_token)
      return true
    })
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
    let csrf = readCachedCsrf()
    if (!csrf) csrf = await fetchCsrf()
    if (csrf) headers['X-CSRF-Token'] = csrf
  }

  const doFetch = (extraHeaders = {}) => fetch(url.toString(), {
    method,
    headers: { ...headers, ...extraHeaders },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let resp = await doFetch()

  // CSRF mismatch (stale cached token) — refetch once and retry.
  if (mutating && resp.status === 403) {
    const cloned = resp.clone()
    const data = await cloned.json().catch(() => null)
    const msg = data && (data.message || (data.detail && data.detail.message))
    if (msg && /csrf/i.test(msg)) {
      writeCachedCsrf(null)
      const fresh = await fetchCsrf()
      if (fresh) resp = await doFetch({ 'X-CSRF-Token': fresh })
    }
  }

  if (resp.status === 401) {
    const ok = await _tryRefresh()
    if (ok) {
      const csrf = readCachedCsrf()
      const retryHeaders = mutating && csrf ? { 'X-CSRF-Token': csrf } : {}
      resp = await doFetch(retryHeaders)
    }
    if (resp.status === 401) {
      writeCachedCsrf(null)
      window.location.href = '/login?error=session_expired'
      return null
    }
  }

  return resp
}

export const get    = (path, opts)  => apiFetch('GET',    path, opts)
export const post   = (path, body)  => apiFetch('POST',   path, { body })
export const del    = (path)        => apiFetch('DELETE',  path)
