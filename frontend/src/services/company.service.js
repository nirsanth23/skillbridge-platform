import api from './api'

export const companyService = {
  getMyProfile: async () => {
    const response = await api.get('/companies/me')
    return response.data
  },

  updateMyProfile: async (data) => {
    const response = await api.patch('/companies/me', data)
    return response.data
  },

  getCompanyById: async (id) => {
    const response = await api.get(`/companies/${id}`)
    return response.data
  },
}

export default companyService
