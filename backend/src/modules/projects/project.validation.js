const ALLOWED_BUDGET_TYPES = ['fixed', 'hourly']
const ALLOWED_PROJECT_TYPES = ['individual', 'company']
const ALLOWED_CREATE_STATUSES = ['draft', 'open']
const ALLOWED_UPDATE_STATUSES = ['draft', 'open', 'in_progress', 'completed', 'cancelled']

/**
 * Validates project creation payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateProjectCreate = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Title
  if (!data.title || typeof data.title !== 'string') {
    errors.title = 'Project title is required'
  } else {
    const trimmedTitle = data.title.trim()
    if (trimmedTitle.length < 5 || trimmedTitle.length > 150) {
      errors.title = 'Project title must be between 5 and 150 characters'
    } else {
      sanitized.title = trimmedTitle
    }
  }

  // Description
  if (!data.description || typeof data.description !== 'string') {
    errors.description = 'Project description is required'
  } else {
    const trimmedDesc = data.description.trim()
    if (trimmedDesc.length < 10 || trimmedDesc.length > 5000) {
      errors.description = 'Project description must be between 10 and 5000 characters'
    } else {
      sanitized.description = trimmedDesc
    }
  }

  // Category
  if (!data.category || typeof data.category !== 'string') {
    errors.category = 'Project category is required'
  } else {
    const trimmedCat = data.category.trim()
    if (trimmedCat.length < 2 || trimmedCat.length > 100) {
      errors.category = 'Category must be between 2 and 100 characters'
    } else {
      sanitized.category = trimmedCat
    }
  }

  // Skills
  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.skills = 'Skills must be an array of strings'
    } else {
      const sanitizedSkills = [
        ...new Set(
          data.skills
            .filter((s) => typeof s === 'string' && s.trim().length > 0)
            .map((s) => s.trim())
        ),
      ]
      sanitized.skills = sanitizedSkills
    }
  } else {
    sanitized.skills = []
  }

  // Budget Type
  if (data.budgetType !== undefined) {
    if (!ALLOWED_BUDGET_TYPES.includes(data.budgetType)) {
      errors.budgetType = `Budget type must be one of: ${ALLOWED_BUDGET_TYPES.join(', ')}`
    } else {
      sanitized.budgetType = data.budgetType
    }
  } else {
    sanitized.budgetType = 'fixed'
  }

  // Budget Min & Max
  let budgetMin = 0
  let budgetMax = 0

  if (data.budgetMin !== undefined && data.budgetMin !== null && data.budgetMin !== '') {
    const minVal = Number(data.budgetMin)
    if (isNaN(minVal) || minVal < 0) {
      errors.budgetMin = 'Minimum budget must be a positive number'
    } else {
      budgetMin = minVal
      sanitized.budgetMin = minVal
    }
  } else {
    sanitized.budgetMin = 0
  }

  if (data.budgetMax !== undefined && data.budgetMax !== null && data.budgetMax !== '') {
    const maxVal = Number(data.budgetMax)
    if (isNaN(maxVal) || maxVal < 0) {
      errors.budgetMax = 'Maximum budget must be a positive number'
    } else {
      budgetMax = maxVal
      sanitized.budgetMax = maxVal
    }
  } else {
    sanitized.budgetMax = sanitized.budgetMin
  }

  if (budgetMax > 0 && budgetMin > 0 && budgetMax < budgetMin) {
    errors.budgetMax = 'Maximum budget cannot be less than minimum budget'
  }

  // Deadline
  if (data.deadline !== undefined && data.deadline !== null && data.deadline !== '') {
    const deadlineDate = new Date(data.deadline)
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = 'Invalid deadline date format'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deadlineDate < today) {
        errors.deadline = 'Deadline cannot be in the past'
      } else {
        sanitized.deadline = deadlineDate
      }
    }
  } else {
    sanitized.deadline = null
  }

  // Project Type
  if (data.projectType !== undefined) {
    if (!ALLOWED_PROJECT_TYPES.includes(data.projectType)) {
      errors.projectType = `Project type must be one of: ${ALLOWED_PROJECT_TYPES.join(', ')}`
    } else {
      sanitized.projectType = data.projectType
    }
  } else {
    sanitized.projectType = 'individual'
  }

  // Status (creation allows 'draft' or 'open')
  if (data.status !== undefined) {
    if (!ALLOWED_CREATE_STATUSES.includes(data.status)) {
      errors.status = `Initial status must be one of: ${ALLOWED_CREATE_STATUSES.join(', ')}`
    } else {
      sanitized.status = data.status
    }
  } else {
    sanitized.status = 'open'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  }
}

/**
 * Validates project update payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateProjectUpdate = (data = {}) => {
  const errors = {}
  const sanitized = {}

  // Title
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.title = 'Project title must be a text string'
    } else {
      const trimmedTitle = data.title.trim()
      if (trimmedTitle.length < 5 || trimmedTitle.length > 150) {
        errors.title = 'Project title must be between 5 and 150 characters'
      } else {
        sanitized.title = trimmedTitle
      }
    }
  }

  // Description
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Project description must be a text string'
    } else {
      const trimmedDesc = data.description.trim()
      if (trimmedDesc.length < 10 || trimmedDesc.length > 5000) {
        errors.description = 'Project description must be between 10 and 5000 characters'
      } else {
        sanitized.description = trimmedDesc
      }
    }
  }

  // Category
  if (data.category !== undefined) {
    if (typeof data.category !== 'string') {
      errors.category = 'Project category must be a text string'
    } else {
      const trimmedCat = data.category.trim()
      if (trimmedCat.length < 2 || trimmedCat.length > 100) {
        errors.category = 'Category must be between 2 and 100 characters'
      } else {
        sanitized.category = trimmedCat
      }
    }
  }

  // Skills
  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.skills = 'Skills must be an array of strings'
    } else {
      sanitized.skills = [
        ...new Set(
          data.skills
            .filter((s) => typeof s === 'string' && s.trim().length > 0)
            .map((s) => s.trim())
        ),
      ]
    }
  }

  // Budget Type
  if (data.budgetType !== undefined) {
    if (!ALLOWED_BUDGET_TYPES.includes(data.budgetType)) {
      errors.budgetType = `Budget type must be one of: ${ALLOWED_BUDGET_TYPES.join(', ')}`
    } else {
      sanitized.budgetType = data.budgetType
    }
  }

  // Budget Min
  if (data.budgetMin !== undefined && data.budgetMin !== null && data.budgetMin !== '') {
    const minVal = Number(data.budgetMin)
    if (isNaN(minVal) || minVal < 0) {
      errors.budgetMin = 'Minimum budget must be a positive number'
    } else {
      sanitized.budgetMin = minVal
    }
  }

  // Budget Max
  if (data.budgetMax !== undefined && data.budgetMax !== null && data.budgetMax !== '') {
    const maxVal = Number(data.budgetMax)
    if (isNaN(maxVal) || maxVal < 0) {
      errors.budgetMax = 'Maximum budget must be a positive number'
    } else {
      sanitized.budgetMax = maxVal
    }
  }

  // Budget comparison if both are present in update
  if (
    sanitized.budgetMin !== undefined &&
    sanitized.budgetMax !== undefined &&
    sanitized.budgetMax > 0 &&
    sanitized.budgetMin > 0 &&
    sanitized.budgetMax < sanitized.budgetMin
  ) {
    errors.budgetMax = 'Maximum budget cannot be less than minimum budget'
  }

  // Deadline
  if (data.deadline !== undefined) {
    if (data.deadline === null || data.deadline === '') {
      sanitized.deadline = null
    } else {
      const deadlineDate = new Date(data.deadline)
      if (isNaN(deadlineDate.getTime())) {
        errors.deadline = 'Invalid deadline date format'
      } else {
        sanitized.deadline = deadlineDate
      }
    }
  }

  // Project Type
  if (data.projectType !== undefined) {
    if (!ALLOWED_PROJECT_TYPES.includes(data.projectType)) {
      errors.projectType = `Project type must be one of: ${ALLOWED_PROJECT_TYPES.join(', ')}`
    } else {
      sanitized.projectType = data.projectType
    }
  }

  // Status
  if (data.status !== undefined) {
    if (!ALLOWED_UPDATE_STATUSES.includes(data.status)) {
      errors.status = `Status must be one of: ${ALLOWED_UPDATE_STATUSES.join(', ')}`
    } else {
      sanitized.status = data.status
    }
  }

  // Check if at least one field is being updated
  if (Object.keys(errors).length === 0 && Object.keys(sanitized).length === 0) {
    errors.general = 'Please provide at least one valid field to update'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  }
}
