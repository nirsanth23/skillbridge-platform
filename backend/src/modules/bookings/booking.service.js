import mongoose from 'mongoose'
import MentorProfile from '../mentors/mentor.model.js'
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
    status: data.status || 'pending',
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
export const getMyBookings = async (userId, { status, role } = {}) => {
  const filter = {}
  if (role === 'mentor') {
    filter.mentor = userId
  } else if (role === 'student') {
    filter.student = userId
  } else {
    filter.$or = [{ student: userId }, { mentor: userId }]
  }

  if (status) {
    if (status === 'upcoming') {
      filter.status = { $in: ['pending', 'confirmed'] }
      filter.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    } else {
      filter.status = status
    }
  }

  const bookings = await Booking.find(filter)
    .populate('mentor', 'name email profileImage role')
    .populate('student', 'name email profileImage role')
    .sort({ date: -1, startTime: 1 })

  return bookings.map((b) => b.toJSON())
}

/**
 * Retrieves incoming booking requests for a mentor
 * @param {string} mentorId 
 * @param {Object} query 
 * @returns {Promise<Array>}
 */
export const getMentorBookingRequests = async (mentorId, { status = 'pending' } = {}) => {
  const filter = { mentor: mentorId }
  if (status) {
    filter.status = status
  }

  const bookings = await Booking.find(filter)
    .populate('student', 'name email profileImage role')
    .populate('mentor', 'name email profileImage role')
    .sort({ createdAt: -1 })

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
 * Mentor accepts a pending booking request
 * @param {string} bookingId 
 * @param {string} mentorId 
 * @returns {Promise<Object>}
 */
export const acceptBooking = async (bookingId, mentorId) => {
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

  if (String(booking.mentor) !== String(mentorId)) {
    const error = new Error('Access denied. You can only accept bookings assigned to you')
    error.statusCode = 403
    throw error
  }

  if (booking.status === 'confirmed') {
    const error = new Error('This booking is already confirmed')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'rejected') {
    const error = new Error('Cannot accept an already rejected booking')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'cancelled') {
    const error = new Error('Cannot accept a cancelled booking')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'completed') {
    const error = new Error('Cannot accept an already completed session')
    error.statusCode = 400
    throw error
  }

  booking.status = 'confirmed'
  await booking.save()

  const mentorUser = await User.findById(mentorId).select('name')
  await createNotification({
    recipient: booking.student,
    type: 'booking_accepted',
    title: 'Mentorship Session Confirmed',
    message: `${mentorUser?.name || 'Your mentor'} accepted your booking request for "${booking.topic}" scheduled on ${new Date(booking.date).toLocaleDateString()} at ${booking.startTime}`,
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
 * Mentor rejects an incoming pending booking request
 * @param {string} bookingId 
 * @param {string} mentorId 
 * @param {string} reason 
 * @returns {Promise<Object>}
 */
export const rejectBooking = async (bookingId, mentorId, reason = '') => {
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

  if (String(booking.mentor) !== String(mentorId)) {
    const error = new Error('Access denied. You can only reject bookings assigned to you')
    error.statusCode = 403
    throw error
  }

  if (booking.status === 'rejected') {
    const error = new Error('This booking is already rejected')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'confirmed') {
    const error = new Error('Cannot reject an already confirmed session. Please cancel instead.')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'completed') {
    const error = new Error('Cannot reject a completed session')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'cancelled') {
    const error = new Error('Cannot reject an already cancelled booking')
    error.statusCode = 400
    throw error
  }

  booking.status = 'rejected'
  await booking.save()

  const mentorUser = await User.findById(mentorId).select('name')
  await createNotification({
    recipient: booking.student,
    type: 'booking_rejected',
    title: 'Mentorship Request Declined',
    message: `${mentorUser?.name || 'Your mentor'} declined your mentorship session request on "${booking.topic}".${reason ? ` Reason: ${reason}` : ''}`,
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
 * Mentor marks a confirmed session as completed
 * @param {string} bookingId 
 * @param {string} mentorId 
 * @returns {Promise<Object>}
 */
export const completeBooking = async (bookingId, mentorId) => {
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

  if (String(booking.mentor) !== String(mentorId)) {
    const error = new Error('Access denied. You can only complete your own mentorship sessions')
    error.statusCode = 403
    throw error
  }

  if (booking.status === 'completed') {
    const error = new Error('This session is already marked as completed')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'pending') {
    const error = new Error('Cannot complete a pending session. The session must be confirmed first.')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'cancelled') {
    const error = new Error('Cannot complete a cancelled session')
    error.statusCode = 400
    throw error
  }

  if (booking.status === 'rejected') {
    const error = new Error('Cannot complete a rejected session')
    error.statusCode = 400
    throw error
  }

  booking.status = 'completed'
  await booking.save()

  // Increment completedSessions counter on MentorProfile
  await MentorProfile.findOneAndUpdate(
    { user: mentorId },
    { $inc: { completedSessions: 1 } }
  )

  const mentorUser = await User.findById(mentorId).select('name')
  await createNotification({
    recipient: booking.student,
    type: 'booking_completed',
    title: 'Mentorship Session Completed',
    message: `${mentorUser?.name || 'Your mentor'} marked the session on "${booking.topic}" as completed. Please consider leaving a review!`,
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
 * Cancels an eligible booking (pending or confirmed)
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

  if (booking.status === 'rejected') {
    const error = new Error('Cannot cancel an already rejected booking')
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
