import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout } from '../services/authService.js'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(email, contrasena) {
    const data = await apiLogin(email, contrasena)
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async function register(nombre, email, contrasena) {
    const data = await apiRegister(nombre, email, contrasena)
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async function fetchMe() {
    try {
      const data = await getMe()
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
    } catch {
      logout()
    }
  }

  function logout() {
    apiLogout()
    token.value = null
    user.value  = null
    localStorage.removeItem('user')
  }

  return { user, token, isLoggedIn, login, register, fetchMe, logout }
})
