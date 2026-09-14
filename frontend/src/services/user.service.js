import api from './api'

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.patch('/users/me', data)
    return response.data
  },
}

export default userService
