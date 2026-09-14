import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import * as userController from './user.controller.js'

const router = express.Router()

// Authenticated user profile routes
router.get('/me', authenticate, userController.getProfile)
router.patch('/me', authenticate, userController.updateProfile)

export default router
