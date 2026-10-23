import mongoose from 'mongoose'
import FreelancerProfile from './freelancer.model.js'
import Project from '../projects/project.model.js'
import Proposal from '../proposals/proposal.model.js'
import Notification from '../notifications/notification.model.js'
import User from '../users/user.model.js'

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

/**
 * Aggregates dashboard data for the authenticated freelancer
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const getFreelancerDashboardData = async (userId) => {
  const [profile, user, proposals, activeProjects, notifications] = await Promise.all([
    FreelancerProfile.findOne({ user: userId }),
    User.findById(userId).select('name email profileImage role isVerified status'),
    Proposal.find({ freelancer: userId })
      .sort({ createdAt: -1 })
      .populate('project', 'title status owner budgetMin budgetMax budgetType deadline category skills')
      .lean(),
    Project.find({ hiredFreelancer: userId })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email profileImage role')
      .lean(),
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ])

  // Profile completion score calculation
  let completionPoints = 0
  const totalPoints = 6
  if (user?.name) completionPoints++
  if (user?.profileImage) completionPoints++
  if (profile?.bio && profile.bio.length >= 20) completionPoints++
  if (profile?.skills && profile.skills.length > 0) completionPoints++
  if (profile?.hourlyRate && profile.hourlyRate > 0) completionPoints++
  if (profile?.portfolio && profile.portfolio.length > 0) completionPoints++
  const profileCompletionPercentage = Math.round((completionPoints / totalPoints) * 100)

  const stats = {
    totalProposals: proposals.length,
    pendingProposals: proposals.filter((p) => p.status === 'pending').length,
    acceptedProposals: proposals.filter((p) => p.status === 'accepted').length,
    rejectedProposals: proposals.filter((p) => p.status === 'rejected').length,
    withdrawnProposals: proposals.filter((p) => p.status === 'withdrawn').length,
    activeProjects: activeProjects.filter((p) => p.status === 'in_progress').length,
    completedProjects: activeProjects.filter((p) => p.status === 'completed').length,
    totalProjectsWorked: activeProjects.length,
    rating: profile?.rating || 0,
    reviewCount: profile?.reviewCount || 0,
    profileCompletionPercentage,
    hourlyRate: profile?.hourlyRate || 0,
    availability: profile?.availability || 'available',
  }

  return {
    stats,
    recentProposals: proposals.slice(0, 5),
    activeProjects: activeProjects.slice(0, 5),
    recentNotifications: notifications,
    profile: profile ? profile.toJSON() : null,
    user: user ? user.toJSON() : null,
  }
}

/**
 * Gets active and assigned projects for the freelancer
 * @param {string} userId
 * @param {Object} queryOptions
 * @returns {Promise<Array>}
 */
export const getActiveProjects = async (userId, queryOptions = {}) => {
  const filter = { hiredFreelancer: userId }
  if (queryOptions.status && ['in_progress', 'completed', 'cancelled'].includes(queryOptions.status)) {
    filter.status = queryOptions.status
  }

  return Project.find(filter)
    .sort({ updatedAt: -1 })
    .populate('owner', 'name email profileImage role')
    .populate('hiredProposal', 'proposedBudget estimatedDuration coverLetter status createdAt')
    .lean()
}

