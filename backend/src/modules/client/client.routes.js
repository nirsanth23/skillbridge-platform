import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as clientController from './client.controller.js'

const router = express.Router()

// Authenticated role-restricted client routes
router.get(
  '/dashboard',
  authenticate,
  authorizeRoles('client'),
  clientController.getDashboard
)

export default router
