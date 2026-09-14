import mongoose from 'mongoose'
import FreelancerProfile from './freelancer.model.js'

/**
 * Retrieves the freelancer profile for the authenticated user (creates if not exists)
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object>} Populated profile
 */
export const getFreelancerProfile = async (userId) => {
  let profile = await FreelancerProfile.findOne({ user: userId }).populate(
    'user',
    'name email profileImage role status isVerified'
  )

  if (!profile) {
    // Auto-create initial profile for registered freelancer
    profile = await FreelancerProfile.create({ user: userId })
    profile = await profile.populate('user', 'name email profileImage role status isVerified')
  }

  return profile.toJSON()
}

/**
 * Updates the freelancer profile with sanitized fields
 * @param {string} userId - User ObjectId
 * @param {Object} updateData - Validated updates
 * @returns {Promise<Object>} Updated profile
 */
export const updateFreelancerProfile = async (userId, updateData) => {
  let profile = await FreelancerProfile.findOne({ user: userId })

  if (!profile) {
    profile = new FreelancerProfile({ user: userId })
  }

  // Apply update fields safely
  const allowedFields = ['bio', 'skills', 'experienceYears', 'hourlyRate', 'portfolio', 'availability']
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      profile[field] = updateData[field]
    }
  })

  await profile.save()
  profile = await profile.populate('user', 'name email profileImage role status isVerified')

  return profile.toJSON()
}

/**
 * Public profile lookup by profile ID or user ID
 * @param {string} id - Freelancer profile ID or User ID
 * @returns {Promise<Object>} Safe public profile
 */
export const getFreelancerById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid freelancer profile ID')
    error.statusCode = 400
    throw error
  }

  // Search by profile _id or associated user _id
  let profile = await FreelancerProfile.findOne({
    $or: [{ _id: id }, { user: id }],
  }).populate('user', 'name profileImage role isVerified')

  if (!profile) {
    const error = new Error('Freelancer profile not found')
    error.statusCode = 404
    throw error
  }

  return profile.toJSON()
}
