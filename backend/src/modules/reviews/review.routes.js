import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as reviewController from './review.controller.js'

const router = express.Router()

// Authenticated reviews routes
router.post('/', authenticate, reviewController.createReview)
router.get('/my', authenticate, authorizeRoles('mentor'), reviewController.getMyReviews)

// Public mentor reviews lookup
router.get('/mentor/:mentorId', reviewController.getMentorReviews)

export default router
