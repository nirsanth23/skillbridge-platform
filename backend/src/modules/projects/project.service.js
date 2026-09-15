import mongoose from 'mongoose'
import Project from './project.model.js'

/**
 * Creates a new project owned by the authenticated user
 * @param {string} userId 
 * @param {Object} projectData 
 * @returns {Promise<Project>}
 */
export const createProject = async (userId, projectData) => {
  const project = new Project({
    ...projectData,
    owner: userId,
  })

  await project.save()
  return project.populate('owner', '_id name email role profileImage')
}

/**
 * Retrieves all projects created by the authenticated user
 * @param {string} userId 
 * @param {Object} queryOptions 
 * @returns {Promise<Array<Project>>}
 */
export const getMyProjects = async (userId, queryOptions = {}) => {
  const filter = { owner: userId }

  if (queryOptions.status) {
    filter.status = queryOptions.status
  }

  return Project.find(filter)
    .sort({ createdAt: -1 })
    .populate('owner', '_id name email role profileImage')
}

/**
 * Retrieves a single project by ID with populated owner information
 * @param {string} projectId 
 * @returns {Promise<Project>}
 */
export const getProjectById = async (projectId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('Invalid project ID format')
    error.statusCode = 400
    throw error
  }

  const project = await Project.findById(projectId).populate(
    'owner',
    '_id name email role profileImage'
  )

  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  return project
}

/**
 * Updates an existing project if the authenticated user is the owner
 * @param {string} projectId 
 * @param {string} userId 
 * @param {Object} updateData 
 * @returns {Promise<Project>}
 */
export const updateProject = async (projectId, userId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('Invalid project ID format')
    error.statusCode = 400
    throw error
  }

  const project = await Project.findById(projectId)
  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  // Enforce strict ownership authorization
  if (project.owner.toString() !== userId.toString()) {
    const error = new Error('Forbidden: You do not have permission to edit this project')
    error.statusCode = 403
    throw error
  }

  // Prevent modifying immutable fields
  delete updateData.owner
  delete updateData._id
  delete updateData.createdAt
  delete updateData.updatedAt

  Object.assign(project, updateData)
  await project.save()

  return project.populate('owner', '_id name email role profileImage')
}

/**
 * Deletes or cancels a project with strict ownership authorization
 * @param {string} projectId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const deleteProject = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error('Invalid project ID format')
    error.statusCode = 400
    throw error
  }

  const project = await Project.findById(projectId)
  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  // Enforce strict ownership authorization
  if (project.owner.toString() !== userId.toString()) {
    const error = new Error('Forbidden: You do not have permission to delete this project')
    error.statusCode = 403
    throw error
  }

  await Project.deleteOne({ _id: projectId })
  return { message: 'Project deleted successfully', projectId }
}
