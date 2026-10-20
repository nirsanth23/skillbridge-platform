import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import authorizeRoles from '../../middleware/role.middleware.js'
import * as bookingController from './booking.controller.js'

const router = express.Router()

router.use(authenticate)

// General authenticated booking operations
router.post('/', bookingController.createBooking)
router.get('/my', bookingController.getMyBookings)

// Mentor-specific booking operations (must precede /:id)
router.get(
  '/mentor/requests',
  authorizeRoles('mentor'),
  bookingController.getMentorBookingRequests
)

// Specific booking operations
router.get('/:id', bookingController.getBookingById)
router.patch('/:id/cancel', bookingController.cancelBooking)
router.patch('/:id/accept', authorizeRoles('mentor'), bookingController.acceptBooking)
router.patch('/:id/reject', authorizeRoles('mentor'), bookingController.rejectBooking)
router.patch('/:id/complete', authorizeRoles('mentor'), bookingController.completeBooking)

export default router

