import { create } from 'zustand'
import apiClient from '../api/client'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user, token } = response.data
      localStorage.setItem('authToken', token)
      set({ user, token, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'Login failed', isLoading: false })
      return false
    }
  },

  register: async (email, password, fullName, companyId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        fullName,
        companyId
      })
      const { user, token } = response.data
      localStorage.setItem('authToken', token)
      set({ user, token, isLoading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error || 'Registration failed', isLoading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user })
}))

export default useAuthStore
