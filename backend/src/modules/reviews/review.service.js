import mongoose from 'mongoose'
import Booking from '../bookings/booking.model.js'
import MentorProfile from '../mentors/mentor.model.js'
import { createNotification } from '../notifications/notification.service.js'
import User from '../users/user.model.js'
import Review from './review.model.js'

/**
 * Creates a verified review for a mentor
 * @param {string} reviewerId 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const createReview = async (reviewerId, data) => {
  const { mentorId, rating, comment, bookingId } = data

  if (String(reviewerId) === String(mentorId)) {
    const error = new Error('Mentors cannot review themselves')
    error.statusCode = 400
    throw error
  }

  const mentorUser = await User.findById(mentorId)
  if (!mentorUser || mentorUser.role !== 'mentor') {
    const error = new Error('Mentor not found')
    error.statusCode = 404
    throw error
  }

  if (bookingId) {
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      const error = new Error('Referenced booking not found')
      error.statusCode = 404
      throw error
    }

    if (
      String(booking.student) !== String(reviewerId) ||
      String(booking.mentor) !== String(mentorId)
    ) {
      const error = new Error('Booking participants do not match reviewer and mentor')
      error.statusCode = 403
      throw error
    }

    const existingReview = await Review.findOne({ reviewer: reviewerId, booking: bookingId })
    if (existingReview) {
      const error = new Error('You have already submitted a review for this session')
      error.statusCode = 409
      throw error
    }
  }

  const review = await Review.create({
    reviewer: reviewerId,
    mentor: mentorId,
    booking: bookingId || null,
    rating,
    comment,
  })

  // Recalculate dynamic average rating & review count for mentor
  const allReviews = await Review.find({ mentor: mentorId })
  const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0)
  const avgRating = allReviews.length > 0 ? Number((totalScore / allReviews.length).toFixed(1)) : 0

  await MentorProfile.findOneAndUpdate(
    { user: mentorId },
    { rating: avgRating, reviewCount: allReviews.length },
    { returnDocument: 'after', upsert: true }
  )

  // Notify mentor
  const reviewerUser = await User.findById(reviewerId).select('name')
  await createNotification({
    recipient: mentorId,
    type: 'review_received',
    title: 'New Review Received',
    message: `${reviewerUser?.name || 'A student'} left a ${rating}-star review: "${comment.slice(0, 80)}${comment.length > 80 ? '...' : ''}"`,
    relatedEntity: {
      entityType: 'review',
      entityId: review._id,
    },
  })

  const populated = await Review.findById(review._id).populate(
    'reviewer',
    'name profileImage role'
  )

  return populated.toJSON()
}

/**
 * Retrieves all reviews for a specific mentor with summary statistics
 * @param {string} mentorId 
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const getMentorReviews = async (mentorId, { page = 1, limit = 20 } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    const error = new Error('Invalid mentor ID')
    error.statusCode = 400
    throw error
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [reviews, totalCount, allReviews] = await Promise.all([
    Review.find({ mentor: mentorId })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ mentor: mentorId }),
    Review.find({ mentor: mentorId }).select('rating'),
  ])

  const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = allReviews.length > 0 ? Number((totalScore / allReviews.length).toFixed(1)) : 0

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  allReviews.forEach((r) => {
    const rounded = Math.floor(r.rating)
    if (distribution[rounded] !== undefined) {
      distribution[rounded]++
    }
  })

  return {
    reviews: reviews.map((r) => r.toJSON()),
    pagination: {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(totalCount / Number(limit)) || 1,
    },
    stats: {
      averageRating,
      totalReviews: totalCount,
      distribution,
    },
  }
}

/**
 * Retrieves reviews received by the authenticated mentor
 * @param {string} userId 
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const getMyReviews = async (userId, query = {}) => {
  return getMentorReviews(userId, query)
}
