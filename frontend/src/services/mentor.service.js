import api from './api'

export const mentorService = {
  /**
   * Get paginated mentors with filtering and search
   */
  getMentors: async (params = {}) => {
    const response = await api.get('/mentors', { params })
    return response.data
  },

  /**
   * Get public mentor profile by ID
   */
  getMentorById: async (id) => {
    const response = await api.get(`/mentors/${id}`)
    return response.data
  },

  /**
   * Get current mentor's own profile
   */
  getMyProfile: async () => {
    const response = await api.get('/mentors/me')
    return response.data
  },

  /**
   * Update mentor's own profile
   */
  updateProfile: async (data) => {
    const response = await api.patch('/mentors/me', data)
    return response.data
  },
}

export default mentorService
