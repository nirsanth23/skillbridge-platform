const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i

/**
 * Validates profile update input payload
 * Strict allowlist: only 'name' and 'profileImage' are permitted
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateUpdateProfileInput = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Validate 'name' if present in request body
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.name = 'Name must be a valid text string'
    } else {
      const trimmedName = data.name.trim()
      if (trimmedName.length === 0) {
        errors.name = 'Name cannot be empty'
      } else if (trimmedName.length < 2 || trimmedName.length > 100) {
        errors.name = 'Name must be between 2 and 100 characters'
      } else {
        sanitized.name = trimmedName
      }
    }
  }

  // Validate 'profileImage' if present in request body
  if (data.profileImage !== undefined) {
    if (data.profileImage === null || data.profileImage === '') {
      sanitized.profileImage = null
    } else if (typeof data.profileImage !== 'string') {
      errors.profileImage = 'Profile image must be a valid string or URL'
    } else {
      const trimmedUrl = data.profileImage.trim()
      if (trimmedUrl.length > 500) {
        errors.profileImage = 'Profile image URL cannot exceed 500 characters'
      } else if (!URL_REGEX.test(trimmedUrl) && !trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('http')) {
        errors.profileImage = 'Please provide a valid URL or path for profile image'
      } else {
        sanitized.profileImage = trimmedUrl
      }
    }
  }

  // Ensure at least one valid field is provided for update
  if (Object.keys(errors).length === 0 && Object.keys(sanitized).length === 0) {
    errors.general = 'Please provide at least one valid field to update (name or profileImage)'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  }
}
