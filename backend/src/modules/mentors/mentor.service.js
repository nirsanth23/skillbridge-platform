import mongoose from 'mongoose'
import MentorProfile from './mentor.model.js'

/**
 * Retrieves the mentor profile for the authenticated user (creates if not exists)
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object>} Populated mentor profile
 */
export const getMentorProfile = async (userId) => {
  let profile = await MentorProfile.findOne({ user: userId }).populate(
    'user',
    'name email profileImage role status isVerified'
  )

  if (!profile) {
    profile = await MentorProfile.create({ user: userId })
    profile = await profile.populate('user', 'name email profileImage role status isVerified')
  }

  return profile.toJSON()
}

/**
 * Updates the mentor profile with sanitized fields
 * @param {string} userId - User ObjectId
 * @param {Object} updateData - Validated updates
 * @returns {Promise<Object>} Updated profile
 */
export const updateMentorProfile = async (userId, updateData) => {
  let profile = await MentorProfile.findOne({ user: userId })

  if (!profile) {
    profile = new MentorProfile({ user: userId })
  }

  const allowedFields = ['bio', 'expertise', 'experienceYears', 'hourlyRate', 'mentoringTopics', 'availability']
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
 * Public mentor profile lookup by profile ID or user ID
 * @param {string} id - Mentor profile ID or User ID
 * @returns {Promise<Object>} Safe public profile
 */
export const getMentorById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid mentor profile ID')
    error.statusCode = 400
    throw error
  }

  let profile = await MentorProfile.findOne({
    $or: [{ _id: id }, { user: id }],
  }).populate('user', 'name profileImage role isVerified')

  if (!profile) {
    const error = new Error('Mentor profile not found')
    error.statusCode = 404
    throw error
  }

  return profile.toJSON()
}
