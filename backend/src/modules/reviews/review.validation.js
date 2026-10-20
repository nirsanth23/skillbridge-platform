import mongoose from 'mongoose'

/**
 * Validates review creation input payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateCreateReview = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Validate mentorId
  if (!data.mentorId) {
    errors.mentorId = 'Mentor ID is required'
  } else if (!mongoose.Types.ObjectId.isValid(data.mentorId)) {
    errors.mentorId = 'Invalid mentor ID format'
  } else {
    sanitized.mentorId = String(data.mentorId)
  }

  // Validate rating
  if (data.rating === undefined || data.rating === null) {
    errors.rating = 'Rating is required'
  } else {
    const rating = Number(data.rating)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.rating = 'Rating must be a number between 1 and 5'
    } else {
      sanitized.rating = Math.round(rating * 10) / 10
    }
  }

  // Validate comment
  if (!data.comment || typeof data.comment !== 'string') {
    errors.comment = 'Review comment is required'
  } else {
    const trimmed = data.comment.trim()
    if (trimmed.length < 3) {
      errors.comment = 'Comment must be at least 3 characters long'
    } else if (trimmed.length > 1000) {
      errors.comment = 'Comment cannot exceed 1000 characters'
    } else {
      sanitized.comment = trimmed
    }
  }

  // Validate optional bookingId
  if (data.bookingId) {
    if (!mongoose.Types.ObjectId.isValid(data.bookingId)) {
      errors.bookingId = 'Invalid booking ID format'
    } else {
      sanitized.bookingId = String(data.bookingId)
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  }
}
