import api from './api'

export const bookingService = {
  /**
   * Book a session with a mentor
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData)
    return response.data
  },

  /**
   * Get all bookings for current user
   */
  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings/my', { params })
    return response.data
  },

  /**
   * Get booking details by ID
   */
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  /**
   * Cancel an eligible booking
   */
  cancelBooking: async (id) => {
    const response = await api.patch(`/bookings/${id}/cancel`)
    return response.data
  },

  /**
   * Get incoming booking requests for mentor
   */
  getBookingRequests: async (params = {}) => {
    const response = await api.get('/bookings/mentor/requests', { params })
    return response.data
  },

  /**
   * Accept an incoming booking request
   */
  acceptBooking: async (id) => {
    const response = await api.patch(`/bookings/${id}/accept`)
    return response.data
  },

  /**
   * Reject an incoming booking request
   */
  rejectBooking: async (id, reason = '') => {
    const response = await api.patch(`/bookings/${id}/reject`, { reason })
    return response.data
  },

  /**
   * Complete a mentorship session
   */
  completeBooking: async (id) => {
    const response = await api.patch(`/bookings/${id}/complete`)
    return response.data
  },
}

export default bookingService
