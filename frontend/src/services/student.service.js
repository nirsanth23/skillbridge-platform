import api from './api'

export const studentService = {
  /**
   * Fetch real-time dashboard data for authenticated student
   */
  getDashboard: async () => {
    const response = await api.get('/student/dashboard')
    return response.data
  },
}

export default studentService
