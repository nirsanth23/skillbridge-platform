import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import { authorizeRoles } from '../../middleware/role.middleware.js'
import * as studentController from './student.controller.js'

const router = express.Router()

router.use(authenticate)
router.use(authorizeRoles('student'))

router.get('/dashboard', studentController.getDashboard)

export default router
