import * as projectService from './project.service.js'
import {
  validateProjectCreate,
  validateProjectQuery,
  validateProjectUpdate,
} from './project.validation.js'

/**
 * @route   GET /api/projects
 * @desc    Browse open projects with search, filters, sort, and pagination
 * @access  Private (All authenticated users)
 */
export const getProjects = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateProjectQuery(req.query)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const result = await projectService.getProjects(sanitized)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   POST /api/projects
 * @desc    Create a new project posting
 * @access  Private (student, client, company)
 */
export const createProject = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateProjectCreate(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const project = await projectService.createProject(req.user.id, sanitized)

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/projects/my
 * @desc    Get all projects created by the authenticated user
 * @access  Private (All authenticated users)
 */
export const getMyProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getMyProjects(req.user.id, req.query)

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: {
        projects,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID with safe owner details
 * @access  Private (All authenticated users)
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id)

    return res.status(200).json({
      success: true,
      data: {
        project,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project details (Owner only)
 * @access  Private
 */
export const updateProject = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateProjectUpdate(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const updatedProject = await projectService.updateProject(
      req.params.id,
      req.user.id,
      sanitized
    )

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete/cancel a project (Owner only)
 * @access  Private
 */
export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.id)

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
