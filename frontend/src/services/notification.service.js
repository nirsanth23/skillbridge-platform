import api from './api'

export const notificationService = {
  /**
   * Get user notifications
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },

  /**
   * Mark all user notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all')
    return response.data
  },
}

export default notificationService
