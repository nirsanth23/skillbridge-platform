import api from './api'

export const reviewService = {
  /**
   * Get public reviews for a mentor by ID
   */
  getMentorReviews: async (mentorId, params = {}) => {
    const response = await api.get(`/reviews/mentor/${mentorId}`, { params })
    return response.data
  },

  /**
   * Get reviews received by the authenticated mentor
   */
  getMyReviews: async (params = {}) => {
    const response = await api.get('/reviews/my', { params })
    return response.data
  },

  /**
   * Submit a review for a completed mentorship session
   */
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData)
    return response.data
  },
}

export default reviewService
