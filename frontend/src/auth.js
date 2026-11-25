import { reactive } from 'vue'
import { api } from './api'
import { clearToken, getToken, setToken } from './storage'

export const auth = reactive({
  user: null
})

export async function initAuth() {
  if (!getToken()) {
    return
  }
  try {
    auth.user = await api('/auth/me')
  } catch {
    clearToken()
    auth.user = null
  }
}

export async function login(username, password, rememberMe) {
  const result = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, rememberMe })
  })
  setToken(result.token, rememberMe)
  auth.user = result.user
  return result.user
}

export function logout() {
  clearToken()
  auth.user = null
}

export async function refreshMe() {
  auth.user = await api('/auth/me')
  return auth.user
}

export function homeFor(role) {
  return role === 'ADMIN' ? '/admin' : '/shop'
}
