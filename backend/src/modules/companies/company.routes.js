import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as companyController from './company.controller.js'

const router = express.Router()

// Authenticated role-restricted routes
router.get('/me', authenticate, authorizeRoles('company'), companyController.getMyProfile)
router.patch('/me', authenticate, authorizeRoles('company'), companyController.updateMyProfile)

// Public profile lookup
router.get('/:id', companyController.getCompanyById)

export default router
