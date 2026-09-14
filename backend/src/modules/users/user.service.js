import User from './user.model.js'

/**
 * Retrieves the profile of an authenticated user
 * @param {string} userId - Authenticated user's ObjectId
 * @returns {Promise<Object>} Safe user profile object
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  if (user.status === 'suspended') {
    const error = new Error('Your account has been suspended. Please contact support.')
    error.statusCode = 403
    throw error
  }

  if (user.status === 'deactivated') {
    const error = new Error('Your account is deactivated. Please contact support.')
    error.statusCode = 403
    throw error
  }

  return user.toJSON()
}

/**
 * Updates an authenticated user's profile with sanitized data
 * @param {string} userId - Authenticated user's ObjectId
 * @param {Object} updateData - Validated & sanitized fields (name, profileImage)
 * @returns {Promise<Object>} Updated safe user profile object
 */
export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  if (user.status !== 'active') {
    const error = new Error(`Account is ${user.status}. Access denied.`)
    error.statusCode = 403
    throw error
  }

  // Apply only explicitly allowed fields
  if (updateData.name !== undefined) {
    user.name = updateData.name
  }

  if (updateData.profileImage !== undefined) {
    user.profileImage = updateData.profileImage
  }

  await user.save()

  return user.toJSON()
}
