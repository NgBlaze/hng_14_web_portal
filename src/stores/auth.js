import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, post } from '../api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const checked = ref(false)

  async function fetchUser() {
    loading.value = true
    try {
      const resp = await get('/auth/whoami')
      if (resp?.ok) {
        const data = await resp.json()
        user.value = data.data
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    } finally {
      loading.value = false
      checked.value = true
    }
  }

  async function logout() {
    await post('/auth/logout', {})
    user.value = null
  }

  return { user, loading, checked, fetchUser, logout }
})
