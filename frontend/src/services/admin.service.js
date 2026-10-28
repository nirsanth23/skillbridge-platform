import api from './api'

export const adminService = {
  /**
   * Fetch aggregated admin dashboard metrics
   */
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  /**
   * List users with pagination, filters, and search
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  /**
   * Get single user administrative details
   */
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  /**
   * Update user status (active, suspended, deactivated)
   */
  updateUserStatus: async (id, status) => {
    const response = await api.patch(`/admin/users/${id}/status`, { status })
    return response.data
  },

  /**
   * List verification requests and review candidates
   */
  getVerifications: async (params = {}) => {
    const response = await api.get('/admin/verifications', { params })
    return response.data
  },

  /**
   * Approve or revoke verification
   */
  updateVerificationStatus: async (id, isVerified) => {
    const response = await api.patch(`/admin/verifications/${id}/status`, { isVerified })
    return response.data
  },

  /**
   * List moderation reports
   */
  getReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params })
    return response.data
  },

  /**
   * Get report details by ID
   */
  getReportById: async (id) => {
    const response = await api.get(`/admin/reports/${id}`)
    return response.data
  },

  /**
   * Update report status (under_review, resolved, dismissed)
   */
  updateReportStatus: async (id, data) => {
    const response = await api.patch(`/admin/reports/${id}/status`, data)
    return response.data
  },

  /**
   * Fetch platform overview distribution and metrics
   */
  getPlatformOverview: async () => {
    const response = await api.get('/admin/platform')
    return response.data
  },
}

export default adminService
