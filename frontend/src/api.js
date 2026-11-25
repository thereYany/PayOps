import { clearToken, getToken } from './storage'

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`/api${path}`, { ...options, headers })
  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken()
      window.dispatchEvent(new Event('payops:unauthorized'))
    }
    throw new Error(data?.message || `请求失败 (${response.status})`)
  }

  return data
}
