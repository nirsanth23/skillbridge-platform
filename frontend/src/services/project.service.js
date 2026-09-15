import api from './api'

export const projectService = {
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData)
    return response.data
  },

  getMyProjects: async (params = {}) => {
    const response = await api.get('/projects/my', { params })
    return response.data
  },

  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  updateProject: async (id, projectData) => {
    const response = await api.patch(`/projects/${id}`, projectData)
    return response.data
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },
}

export default projectService
