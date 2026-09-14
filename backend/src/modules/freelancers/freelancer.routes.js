import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as freelancerController from './freelancer.controller.js'

const router = express.Router()

// Authenticated role-restricted routes
router.get('/me', authenticate, authorizeRoles('freelancer'), freelancerController.getMyProfile)
router.patch('/me', authenticate, authorizeRoles('freelancer'), freelancerController.updateMyProfile)

// Public profile lookup
router.get('/:id', freelancerController.getFreelancerById)

export default router
