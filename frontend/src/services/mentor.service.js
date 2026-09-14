import api from './api'

export const mentorService = {
  getMyProfile: async () => {
    const response = await api.get('/mentors/me')
    return response.data
  },

  updateMyProfile: async (data) => {
    const response = await api.patch('/mentors/me', data)
    return response.data
  },

  getMentorById: async (id) => {
    const response = await api.get(`/mentors/${id}`)
    return response.data
  },
}

export default mentorService
