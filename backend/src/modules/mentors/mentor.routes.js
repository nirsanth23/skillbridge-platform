import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as mentorController from './mentor.controller.js'

const router = express.Router()

// Authenticated role-restricted routes
router.get('/me', authenticate, authorizeRoles('mentor'), mentorController.getMyProfile)
router.patch('/me', authenticate, authorizeRoles('mentor'), mentorController.updateMyProfile)

// Public profile lookup
router.get('/:id', mentorController.getMentorById)

export default router
