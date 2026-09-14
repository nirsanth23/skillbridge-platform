import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import * as authController from './auth.controller.js'

const router = express.Router()

// Public authentication routes
router.post('/register', authController.register)
router.post('/login', authController.login)

// Protected authentication routes
router.get('/me', authenticate, authController.getMe)
router.post('/logout', authenticate, authController.logout)

export default router
