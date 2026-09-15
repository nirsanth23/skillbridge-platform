const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/

const ALLOWED_REGISTRATION_ROLES = [
  'student',
  'client',
  'freelancer',
  'mentor',
  'company',
]

/**
 * Validates user registration payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateRegisterInput = (data = {}) => {
  const errors = {}

  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
  const password = typeof data.password === 'string' ? data.password : ''
  const role = typeof data.role === 'string' ? data.role.trim().toLowerCase() : 'student'

  if (!name) {
    errors.name = 'Name is required'
  } else if (name.length < 2 || name.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters'
  }

  if (!email) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long'
  }

  if (role === 'admin') {
    errors.role = 'Public registration for admin role is prohibited'
  } else if (!ALLOWED_REGISTRATION_ROLES.includes(role)) {
    errors.role = `Invalid role. Allowed roles: ${ALLOWED_REGISTRATION_ROLES.join(', ')}`
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name,
      email,
      password,
      role,
    },
  }
}

/**
 * Validates user login payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateLoginInput = (data = {}) => {
  const errors = {}

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
  const password = typeof data.password === 'string' ? data.password : ''

  if (!email) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      email,
      password,
    },
  }
}

/**
 * Validates change password payload
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateChangePasswordInput = (data = {}) => {
  const errors = {}

  const currentPassword = typeof data.currentPassword === 'string' ? data.currentPassword : ''
  const newPassword = typeof data.newPassword === 'string' ? data.newPassword : ''

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required'
  }

  if (!newPassword) {
    errors.newPassword = 'New password is required'
  } else if (newPassword.length < 6) {
    errors.newPassword = 'New password must be at least 6 characters long'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      currentPassword,
      newPassword,
    },
  }
}

