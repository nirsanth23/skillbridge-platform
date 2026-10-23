import api from './api'

export const proposalService = {
  /**
   * Submit a proposal for a project
   */
  createProposal: async (data) => {
    const response = await api.post('/proposals', data)
    return response.data
  },

  /**
   * Get all proposals for a specific project (Project Owner)
   */
  getProjectProposals: async (projectId) => {
    const response = await api.get(`/proposals/project/${projectId}`)
    return response.data
  },

  /**
   * Get all proposals received across all user's projects
   */
  getMyProjectsProposals: async () => {
    const response = await api.get('/proposals/my-projects')
    return response.data
  },

  /**
   * Get proposal details by ID
   */
  getProposalById: async (id) => {
    const response = await api.get(`/proposals/${id}`)
    return response.data
  },

  /**
   * Accept proposal and hire freelancer
   */
  acceptProposal: async (id) => {
    const response = await api.patch(`/proposals/${id}/accept`)
    return response.data
  },

  /**
   * Reject proposal
   */
  rejectProposal: async (id) => {
    const response = await api.patch(`/proposals/${id}/reject`)
    return response.data
  },

  /**
   * Get all proposals submitted by the logged-in freelancer
   */
  getMyProposals: async (params = {}) => {
    const response = await api.get('/proposals/my', { params })
    return response.data
  },

  /**
   * Update pending proposal details
   */
  updateProposal: async (id, data) => {
    const response = await api.patch(`/proposals/${id}`, data)
    return response.data
  },

  /**
   * Withdraw pending proposal
   */
  withdrawProposal: async (id) => {
    const response = await api.patch(`/proposals/${id}/withdraw`)
    return response.data
  },
}

export default proposalService
