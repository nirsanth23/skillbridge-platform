import * as bookingService from './booking.service.js'
import { validateCreateBookingInput } from './booking.validation.js'

/**
 * @route   POST /api/bookings
 * @desc    Create a new mentor booking
 * @access  Private
 */
export const createBooking = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateCreateBookingInput(req.body)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const booking = await bookingService.createBooking(req.user.id, sanitized)
    return res.status(201).json({
      success: true,
      message: 'Mentor session booked successfully',
      data: { booking },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/bookings/my
 * @desc    Get all bookings for authenticated user
 * @access  Private
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user.id, req.query)
    return res.status(200).json({
      success: true,
      data: { bookings },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID
 * @access  Private
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      data: { booking },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking },
    })
  } catch (error) {
    next(error)
  }
}
