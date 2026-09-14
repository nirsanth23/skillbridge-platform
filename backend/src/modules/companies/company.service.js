import mongoose from 'mongoose'
import CompanyProfile from './company.model.js'

/**
 * Retrieves the company profile for the authenticated user (creates if not exists)
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object>} Populated company profile
 */
export const getCompanyProfile = async (userId) => {
  let profile = await CompanyProfile.findOne({ user: userId }).populate(
    'user',
    'name email profileImage role status isVerified'
  )

  if (!profile) {
    profile = await CompanyProfile.create({
      user: userId,
      companyName: 'My Company',
    })
    profile = await profile.populate('user', 'name email profileImage role status isVerified')
  }

  return profile.toJSON()
}

/**
 * Updates the company profile with sanitized fields
 * @param {string} userId - User ObjectId
 * @param {Object} updateData - Validated updates
 * @returns {Promise<Object>} Updated profile
 */
export const updateCompanyProfile = async (userId, updateData) => {
  let profile = await CompanyProfile.findOne({ user: userId })

  if (!profile) {
    profile = new CompanyProfile({ user: userId })
  }

  const allowedFields = ['companyName', 'description', 'industry', 'website', 'location', 'companySize']
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
 * Public company profile lookup by profile ID or user ID
 * @param {string} id - Company profile ID or User ID
 * @returns {Promise<Object>} Safe public profile
 */
export const getCompanyById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid company profile ID')
    error.statusCode = 400
    throw error
  }

  let profile = await CompanyProfile.findOne({
    $or: [{ _id: id }, { user: id }],
  }).populate('user', 'name profileImage role isVerified')

  if (!profile) {
    const error = new Error('Company profile not found')
    error.statusCode = 404
    throw error
  }

  return profile.toJSON()
}
