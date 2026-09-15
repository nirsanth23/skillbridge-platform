import mongoose from 'mongoose'
import Project from './project.model.js'

const OWNER_SAFE_PROJECTION = '_id name profileImage role isVerified'

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
  return project.populate('owner', OWNER_SAFE_PROJECTION)
}

/**
 * Retrieves projects for marketplace discovery (status: 'open') with search, filtering, sorting, and pagination
 * @param {Object} queryParams 
 * @returns {Promise<{ projects: Array<Project>, total: number, page: number, limit: number, totalPages: number }>}
 */
export const getProjects = async (queryParams = {}) => {
  const { search, category, skills, budgetType, sort = 'newest', page = 1, limit = 10 } = queryParams

  // Marketplace discovery ONLY returns status: 'open'
  const filter = { status: 'open' }

  // Case-insensitive search on title or description
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ]
  }

  // Category filter
  if (category) {
    filter.category = category
  }

  // Skills filter (matches if project contains any of the requested skills)
  if (skills && skills.length > 0) {
    filter.skills = {
      $in: skills.map((s) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')),
    }
  }

  // Budget Type filter
  if (budgetType) {
    filter.budgetType = budgetType
  }

  // Sorting
  const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 }

  // Total matching records count
  const total = await Project.countDocuments(filter)

  // Query paginated results with safe owner projection
  const skip = (page - 1) * limit
  const projects = await Project.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('owner', OWNER_SAFE_PROJECTION)

  const totalPages = Math.ceil(total / limit) || 1

  return {
    projects,
    total,
    page,
    limit,
    totalPages,
  }
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
    .populate('owner', OWNER_SAFE_PROJECTION)
}

/**
 * Retrieves a single project by ID with safe owner information
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
    OWNER_SAFE_PROJECTION
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

  return project.populate('owner', OWNER_SAFE_PROJECTION)
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
