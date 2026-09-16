import mongoose from 'mongoose'
import { createNotification } from '../notifications/notification.service.js'
import User from '../users/user.model.js'
import Booking from './booking.model.js'

/**
 * Creates a new mentor booking session
 * @param {string} studentId 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const createBooking = async (studentId, data) => {
  const { mentorId, date, startTime, endTime, topic, notes } = data

  const mentor = await User.findById(mentorId)
  if (!mentor || mentor.status !== 'active') {
    const error = new Error('Mentor not found or unavailable')
    error.statusCode = 404
    throw error
  }

  if (mentor.role !== 'mentor') {
    const error = new Error('Selected user is not registered as a mentor')
    error.statusCode = 400
    throw error
  }

  if (String(mentorId) === String(studentId)) {
    const error = new Error('You cannot book a mentorship session with yourself')
    error.statusCode = 400
    throw error
  }

  // Check for duplicate/overlapping active booking on same date & time for student
  const existingBooking = await Booking.findOne({
    student: studentId,
    mentor: mentorId,
    date,
    startTime,
    status: { $in: ['pending', 'confirmed'] },
  })

  if (existingBooking) {
    const error = new Error('You already have an active booking with this mentor for the selected time slot')
    error.statusCode = 409
    throw error
  }

  const booking = await Booking.create({
    student: studentId,
    mentor: mentorId,
    date,
    startTime,
    endTime,
    topic,
    notes,
    status: 'confirmed',
  })

  const student = await User.findById(studentId).select('name')

  // Notify mentor
  await createNotification({
    recipient: mentorId,
    type: 'booking_created',
    title: 'New Mentorship Session Booked',
    message: `${student?.name || 'A student'} booked a mentorship session on "${topic}" for ${new Date(date).toLocaleDateString()} at ${startTime}`,
    relatedEntity: {
      entityType: 'booking',
      entityId: booking._id,
    },
  })

  const populated = await Booking.findById(booking._id)
    .populate('mentor', 'name email profileImage role')
    .populate('student', 'name email profileImage role')

  return populated.toJSON()
}

/**
 * Retrieves all bookings for the authenticated user (as student or mentor)
 * @param {string} userId 
 * @param {Object} query 
 * @returns {Promise<Array>}
 */
export const getMyBookings = async (userId, { status } = {}) => {
  const filter = {
    $or: [{ student: userId }, { mentor: userId }],
  }

  if (status) {
    filter.status = status
  }

  const bookings = await Booking.find(filter)
    .populate('mentor', 'name email profileImage role')
    .populate('student', 'name email profileImage role')
    .sort({ date: -1, startTime: 1 })

  return bookings.map((b) => b.toJSON())
}

/**
 * Retrieves a single booking by ID with ownership check
 * @param {string} bookingId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getBookingById = async (bookingId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error('Invalid booking ID')
    error.statusCode = 400
    throw error
  }

  const booking = await Booking.findById(bookingId)
    .populate('mentor', 'name email profileImage role')
    .populate('student', 'name email profileImage role')

  if (!booking) {
    const error = new Error('Booking not found')
    error.statusCode = 404
    throw error
  }

  const isStudent = String(booking.student?._id) === String(userId)
  const isMentor = String(booking.mentor?._id) === String(userId)

  if (!isStudent && !isMentor) {
    const error = new Error('Access denied. You are not a participant in this booking')
    error.statusCode = 403
    throw error
  }

  return booking.toJSON()
}

/**
 * Cancels an eligible booking
 * @param {string} bookingId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const cancelBooking = async (bookingId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error('Invalid booking ID')
    error.statusCode = 400
    throw error
  }

  const booking = await Booking.findById(bookingId)
  if (!booking) {
    const error = new Error('Booking not found')
    error.statusCode = 404
    throw error
  }

  const isStudent = String(booking.student) === String(userId)
  const isMentor = String(booking.mentor) === String(userId)

  if (!isStudent && !isMentor) {
    const error = new Error('Access denied. You can only cancel your own bookings')
    error.statusCode = 403
    throw error
  }

  if (booking.status === 'cancelled') {
    const error = new Error('This booking is already cancelled')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'completed') {
    const error = new Error('Completed sessions cannot be cancelled')
    error.statusCode = 400
    throw error
  }

  booking.status = 'cancelled'
  await booking.save()

  // Notify other party
  const otherParticipantId = isStudent ? booking.mentor : booking.student
  const cancellingUser = await User.findById(userId).select('name')

  await createNotification({
    recipient: otherParticipantId,
    type: 'booking_cancelled',
    title: 'Mentorship Session Cancelled',
    message: `${cancellingUser?.name || 'A participant'} cancelled the session scheduled on "${booking.topic}"`,
    relatedEntity: {
      entityType: 'booking',
      entityId: booking._id,
    },
  })

  const populated = await Booking.findById(booking._id)
    .populate('mentor', 'name email profileImage role')
    .populate('student', 'name email profileImage role')

  return populated.toJSON()
}
