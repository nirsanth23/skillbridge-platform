import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as projectController from './project.controller.js'

const router = express.Router()

// Project discovery / marketplace browsing (All authenticated roles)
router.get('/', authenticate, projectController.getProjects)

// Create project - restricted to student, client, company
router.post(
  '/',
  authenticate,
  authorizeRoles('student', 'client', 'company'),
  projectController.createProject
)

// List my projects (authenticated user's own projects)
router.get('/my', authenticate, projectController.getMyProjects)

// Single project by ID
router.get('/:id', authenticate, projectController.getProjectById)

// Update project (Ownership verified in service layer)
router.patch('/:id', authenticate, projectController.updateProject)

// Delete project (Ownership verified in service layer)
router.delete('/:id', authenticate, projectController.deleteProject)

export default router
