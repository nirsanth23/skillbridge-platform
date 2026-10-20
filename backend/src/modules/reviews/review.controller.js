import * as reviewService from './review.service.js'
import { validateCreateReview } from './review.validation.js'

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a mentor
 * @access  Private (Authenticated users, except self)
 */
export const createReview = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateCreateReview(req.body)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const review = await reviewService.createReview(req.user.id, sanitized)
    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/reviews/mentor/:mentorId
 * @desc    Get all reviews and rating stats for a mentor
 * @access  Public
 */
export const getMentorReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getMentorReviews(
      req.params.mentorId,
      req.query
    )
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/reviews/my
 * @desc    Get reviews for authenticated mentor
 * @access  Private (Mentor only)
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getMyReviews(req.user.id, req.query)
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
