import api from './api'

export const freelancerService = {
  getFreelancers: async (params = {}) => {
    const response = await api.get('/freelancers', { params })
    return response.data
  },

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

  getDashboard: async () => {
    const response = await api.get('/freelancers/dashboard')
    return response.data
  },

  getActiveProjects: async (params = {}) => {
    const response = await api.get('/freelancers/active-projects', { params })
    return response.data
  },
}

export default freelancerService
