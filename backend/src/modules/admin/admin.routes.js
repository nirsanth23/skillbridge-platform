import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as adminController from './admin.controller.js'

const router = express.Router()

// Public/authenticated moderation report submission
// Any authenticated user can report suspicious activity or content
router.post('/reports', authenticate, adminController.createReport)

// All administrative management routes strictly require authentication and 'admin' role
router.use(authenticate)
router.use(authorizeRoles('admin'))

// Admin Dashboard
router.get('/dashboard', adminController.getDashboard)

// User Management
router.get('/users', adminController.getUsers)
router.get('/users/:id', adminController.getUserById)
router.patch('/users/:id/status', adminController.updateUserStatus)
router.patch('/users/:id/verify', adminController.updateVerificationStatus)

// Verification Management
router.get('/verifications', adminController.getVerifications)
router.patch('/verifications/:id/status', adminController.updateVerificationStatus)

// Moderation & Reports (Admin inspection and resolution)
router.get('/reports', adminController.getReports)
router.get('/reports/:id', adminController.getReportById)
router.patch('/reports/:id/status', adminController.updateReportStatus)

// Platform Overview
router.get('/platform', adminController.getPlatformOverview)

export default router
