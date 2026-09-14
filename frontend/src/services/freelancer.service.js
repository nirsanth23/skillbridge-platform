import api from './api'

export const freelancerService = {
  getMyProfile: async () => {
    const response = await api.get('/freelancers/me')
    return response.data
  },

  updateMyProfile: async (data) => {
    const response = await api.patch('/freelancers/me', data)
    return response.data
  },

  getFreelancerById: async (id) => {
    const response = await api.get(`/freelancers/${id}`)
    return response.data
  },
}

export default freelancerService
