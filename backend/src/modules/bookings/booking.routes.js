import express from 'express'
import authenticate from '../../middleware/auth.middleware.js'
import * as bookingController from './booking.controller.js'

const router = express.Router()

router.use(authenticate)

router.post('/', bookingController.createBooking)
router.get('/my', bookingController.getMyBookings)
router.get('/:id', bookingController.getBookingById)
router.patch('/:id/cancel', bookingController.cancelBooking)

export default router
