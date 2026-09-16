import mongoose from 'mongoose'

/**
 * Validates proposal submission payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateCreateProposalInput = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Validate projectId
  if (!data.projectId || !mongoose.Types.ObjectId.isValid(data.projectId)) {
    errors.projectId = 'A valid project ID is required'
  } else {
    sanitized.projectId = String(data.projectId)
  }

  // Validate coverLetter
  if (typeof data.coverLetter !== 'string' || !data.coverLetter.trim()) {
    errors.coverLetter = 'Cover letter is required'
  } else {
    const trimmed = data.coverLetter.trim()
    if (trimmed.length < 10) {
      errors.coverLetter = 'Cover letter must be at least 10 characters long'
    } else if (trimmed.length > 3000) {
      errors.coverLetter = 'Cover letter cannot exceed 3000 characters'
    } else {
      sanitized.coverLetter = trimmed
    }
  }

  // Validate proposedBudget
  if (data.proposedBudget === undefined || data.proposedBudget === null || data.proposedBudget === '') {
    errors.proposedBudget = 'Proposed budget is required'
  } else {
    const num = Number(data.proposedBudget)
    if (Number.isNaN(num) || num < 0) {
      errors.proposedBudget = 'Proposed budget must be a positive number'
    } else {
      sanitized.proposedBudget = num
    }
  }

  // Validate estimatedDuration
  if (typeof data.estimatedDuration !== 'string' || !data.estimatedDuration.trim()) {
    errors.estimatedDuration = 'Estimated duration is required'
  } else {
    const trimmedDuration = data.estimatedDuration.trim()
    if (trimmedDuration.length > 100) {
      errors.estimatedDuration = 'Estimated duration cannot exceed 100 characters'
    } else {
      sanitized.estimatedDuration = trimmedDuration
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  }
}
