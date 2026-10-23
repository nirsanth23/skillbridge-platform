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

/**
 * Public freelancer discovery with search, skills, availability, rate filtering, sorting, and pagination
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export const getFreelancers = async (query = {}) => {
  const {
    search,
    skills,
    availability,
    minRate,
    maxRate,
    sortBy = 'rating',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = query

  const filter = {}

  if (availability && ['available', 'busy', 'not_available'].includes(availability)) {
    filter.availability = availability
  }

  if (skills) {
    if (Array.isArray(skills)) {
      filter.skills = { $in: skills.map((s) => new RegExp(String(s).trim(), 'i')) }
    } else if (typeof skills === 'string') {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean)
      if (skillList.length > 0) {
        filter.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) }
      }
    }
  }

  if (minRate !== undefined || maxRate !== undefined) {
    filter.hourlyRate = {}
    if (minRate !== undefined && !Number.isNaN(Number(minRate))) {
      filter.hourlyRate.$gte = Number(minRate)
    }
    if (maxRate !== undefined && !Number.isNaN(Number(maxRate))) {
      filter.hourlyRate.$lte = Number(maxRate)
    }
  }

  if (search && typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i')
    filter.$or = [
      { bio: searchRegex },
      { skills: searchRegex },
    ]
  }

  const sort = {}
  const order = sortOrder === 'asc' ? 1 : -1
  if (sortBy === 'hourlyRate') {
    sort.hourlyRate = order
  } else if (sortBy === 'experienceYears' || sortBy === 'experience') {
    sort.experienceYears = order
  } else if (sortBy === 'createdAt') {
    sort.createdAt = order
  } else {
    sort.rating = order
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12))
  const skip = (pageNum - 1) * limitNum

  const [freelancers, total] = await Promise.all([
    FreelancerProfile.find(filter)
      .populate('user', 'name profileImage role isVerified')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    FreelancerProfile.countDocuments(filter),
  ])

  return {
    freelancers: freelancers.map((f) => f.toJSON()),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }
}

