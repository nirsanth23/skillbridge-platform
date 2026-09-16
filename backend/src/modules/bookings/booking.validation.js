import mongoose from 'mongoose'

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * Validates mentor booking payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateCreateBookingInput = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Validate mentorId
  if (!data.mentorId || !mongoose.Types.ObjectId.isValid(data.mentorId)) {
    errors.mentorId = 'A valid mentor ID is required'
  } else {
    sanitized.mentorId = String(data.mentorId)
  }

  // Validate date
  if (!data.date) {
    errors.date = 'Booking date is required'
  } else {
    const bookingDate = new Date(data.date)
    if (Number.isNaN(bookingDate.getTime())) {
      errors.date = 'Please provide a valid date'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      bookingDate.setHours(0, 0, 0, 0)

      if (bookingDate < today) {
        errors.date = 'Booking date cannot be in the past'
      } else {
        sanitized.date = bookingDate
      }
    }
  }

  // Validate startTime
  if (!data.startTime || typeof data.startTime !== 'string' || !TIME_REGEX.test(data.startTime.trim())) {
    errors.startTime = 'Start time is required in 24-hour format (HH:MM)'
  } else {
    sanitized.startTime = data.startTime.trim()
  }

  // Validate endTime
  if (!data.endTime || typeof data.endTime !== 'string' || !TIME_REGEX.test(data.endTime.trim())) {
    errors.endTime = 'End time is required in 24-hour format (HH:MM)'
  } else {
    sanitized.endTime = data.endTime.trim()
  }

  // Validate time logic
  if (sanitized.startTime && sanitized.endTime) {
    const [startH, startM] = sanitized.startTime.split(':').map(Number)
    const [endH, endM] = sanitized.endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    if (endMinutes <= startMinutes) {
      errors.endTime = 'End time must be after start time'
    }
  }

  // Validate topic
  if (typeof data.topic !== 'string' || !data.topic.trim()) {
    errors.topic = 'Session topic is required'
  } else {
    const trimmedTopic = data.topic.trim()
    if (trimmedTopic.length < 3) {
      errors.topic = 'Topic must be at least 3 characters long'
    } else if (trimmedTopic.length > 200) {
      errors.topic = 'Topic cannot exceed 200 characters'
    } else {
      sanitized.topic = trimmedTopic
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes !== null) {
    if (typeof data.notes !== 'string') {
      errors.notes = 'Notes must be text'
    } else {
      const trimmedNotes = data.notes.trim()
      if (trimmedNotes.length > 1000) {
        errors.notes = 'Notes cannot exceed 1000 characters'
      } else {
        sanitized.notes = trimmedNotes
      }
    }
  } else {
    sanitized.notes = ''
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  }
}
