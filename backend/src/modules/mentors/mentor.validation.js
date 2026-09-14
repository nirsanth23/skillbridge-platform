const ALLOWED_AVAILABILITY = ['available', 'busy', 'not_available']

/**
 * Validates mentor profile update payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateMentorUpdate = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Validate bio
  if (data.bio !== undefined) {
    if (typeof data.bio !== 'string') {
      errors.bio = 'Bio must be a valid text string'
    } else if (data.bio.length > 2000) {
      errors.bio = 'Bio cannot exceed 2000 characters'
    } else {
      sanitized.bio = data.bio.trim()
    }
  }

  // Validate expertise
  if (data.expertise !== undefined) {
    if (!Array.isArray(data.expertise)) {
      errors.expertise = 'Expertise must be an array of domain names'
    } else {
      const validExpertise = data.expertise
        .filter((e) => typeof e === 'string' && e.trim().length > 0)
        .map((e) => e.trim())
      sanitized.expertise = [...new Set(validExpertise)]
    }
  }

  // Validate experienceYears
  if (data.experienceYears !== undefined) {
    const years = Number(data.experienceYears)
    if (isNaN(years) || years < 0) {
      errors.experienceYears = 'Experience years must be a non-negative number'
    } else if (years > 70) {
      errors.experienceYears = 'Experience years cannot exceed 70'
    } else {
      sanitized.experienceYears = years
    }
  }

  // Validate hourlyRate
  if (data.hourlyRate !== undefined) {
    const rate = Number(data.hourlyRate)
    if (isNaN(rate) || rate < 0) {
      errors.hourlyRate = 'Hourly rate must be a non-negative number'
    } else {
      sanitized.hourlyRate = rate
    }
  }

  // Validate mentoringTopics
  if (data.mentoringTopics !== undefined) {
    if (!Array.isArray(data.mentoringTopics)) {
      errors.mentoringTopics = 'Mentoring topics must be an array of topic names'
    } else {
      const validTopics = data.mentoringTopics
        .filter((t) => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim())
      sanitized.mentoringTopics = [...new Set(validTopics)]
    }
  }

  // Validate availability
  if (data.availability !== undefined) {
    if (!ALLOWED_AVAILABILITY.includes(data.availability)) {
      errors.availability = `Invalid availability status. Allowed: ${ALLOWED_AVAILABILITY.join(', ')}`
    } else {
      sanitized.availability = data.availability
    }
  }

  // Check if at least one valid field is being updated
  if (Object.keys(errors).length === 0 && Object.keys(sanitized).length === 0) {
    errors.general = 'Please provide at least one valid field to update'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  }
}
