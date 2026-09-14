const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i
const ALLOWED_AVAILABILITY = ['available', 'busy', 'not_available']

/**
 * Validates freelancer profile update payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateFreelancerUpdate = (data = {}) => {
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

  // Validate skills
  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.skills = 'Skills must be an array of skill names'
    } else {
      const validSkills = data.skills
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .map((s) => s.trim())
      sanitized.skills = [...new Set(validSkills)] // remove duplicates
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

  // Validate portfolio
  if (data.portfolio !== undefined) {
    if (!Array.isArray(data.portfolio)) {
      errors.portfolio = 'Portfolio must be an array of project items'
    } else {
      const sanitizedPortfolio = []
      for (let i = 0; i < data.portfolio.length; i++) {
        const item = data.portfolio[i]
        if (!item || typeof item !== 'object' || typeof item.title !== 'string' || !item.title.trim()) {
          errors[`portfolio[${i}]`] = 'Portfolio item must include a valid title'
          break
        }
        sanitizedPortfolio.push({
          title: item.title.trim(),
          description: typeof item.description === 'string' ? item.description.trim() : '',
          projectUrl: typeof item.projectUrl === 'string' && item.projectUrl.trim() ? item.projectUrl.trim() : null,
          imageUrl: typeof item.imageUrl === 'string' && item.imageUrl.trim() ? item.imageUrl.trim() : null,
          githubUrl: typeof item.githubUrl === 'string' && item.githubUrl.trim() ? item.githubUrl.trim() : null,
        })
      }
      if (!errors.portfolio && Object.keys(errors).length === 0) {
        sanitized.portfolio = sanitizedPortfolio
      }
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
