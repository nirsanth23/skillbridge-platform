import api from './api'

export const clientService = {
  /**
   * Fetch real-time dashboard data for authenticated client
   * @returns {Promise<Object>}
   */
  getDashboard: async () => {
    const response = await api.get('/client/dashboard')
    return response.data
  },
}

export default clientService
