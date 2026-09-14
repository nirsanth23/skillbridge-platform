const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i
const ALLOWED_COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

/**
 * Validates company profile update payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateCompanyUpdate = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Validate companyName
  if (data.companyName !== undefined) {
    if (typeof data.companyName !== 'string') {
      errors.companyName = 'Company name must be a valid text string'
    } else {
      const trimmedName = data.companyName.trim()
      if (trimmedName.length < 2 || trimmedName.length > 150) {
        errors.companyName = 'Company name must be between 2 and 150 characters'
      } else {
        sanitized.companyName = trimmedName
      }
    }
  }

  // Validate description
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a valid text string'
    } else if (data.description.length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters'
    } else {
      sanitized.description = data.description.trim()
    }
  }

  // Validate industry
  if (data.industry !== undefined) {
    if (typeof data.industry !== 'string') {
      errors.industry = 'Industry must be a valid text string'
    } else if (data.industry.length > 100) {
      errors.industry = 'Industry cannot exceed 100 characters'
    } else {
      sanitized.industry = data.industry.trim()
    }
  }

  // Validate website
  if (data.website !== undefined) {
    if (data.website === null || data.website === '') {
      sanitized.website = null
    } else if (typeof data.website !== 'string') {
      errors.website = 'Website must be a valid URL string'
    } else {
      const trimmedUrl = data.website.trim()
      if (!URL_REGEX.test(trimmedUrl) && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        errors.website = 'Please provide a valid website URL (e.g. https://company.com)'
      } else {
        sanitized.website = trimmedUrl
      }
    }
  }

  // Validate location
  if (data.location !== undefined) {
    if (typeof data.location !== 'string') {
      errors.location = 'Location must be a valid text string'
    } else if (data.location.length > 150) {
      errors.location = 'Location cannot exceed 150 characters'
    } else {
      sanitized.location = data.location.trim()
    }
  }

  // Validate companySize
  if (data.companySize !== undefined) {
    if (!ALLOWED_COMPANY_SIZES.includes(data.companySize)) {
      errors.companySize = `Invalid company size. Allowed: ${ALLOWED_COMPANY_SIZES.join(', ')}`
    } else {
      sanitized.companySize = data.companySize
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
