import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import * as notificationController from './notification.controller.js'

const router = express.Router()

router.use(authenticate)

router.get('/', notificationController.getMyNotifications)
router.patch('/read-all', notificationController.markAllAsRead)
router.patch('/:id/read', notificationController.markAsRead)

export default router
