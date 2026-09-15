import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Stateless logout: ignore backend network error
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },
}

export default authService

