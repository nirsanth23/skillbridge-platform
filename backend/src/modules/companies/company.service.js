import mongoose from 'mongoose'
import CompanyProfile from './company.model.js'
import User from '../users/user.model.js'
import Project from '../projects/project.model.js'
import Proposal from '../proposals/proposal.model.js'
import Notification from '../notifications/notification.model.js'

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

/**
 * Calculates aggregated dashboard data for the authenticated company
 * @param {string} userId - Company's User ObjectId
 * @returns {Promise<Object>} Aggregated dashboard statistics
 */
export const getCompanyDashboardData = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Invalid user ID')
    error.statusCode = 400
    throw error
  }

  const [user, profile, projects, notifications] = await Promise.all([
    User.findById(userId).select('name email profileImage role isVerified status'),
    CompanyProfile.findOne({ user: userId }),
    Project.find({ owner: userId }).sort({ createdAt: -1 }),
    Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(10),
  ])

  const projectIds = projects.map((p) => p._id)

  const proposals = await Proposal.find({ project: { $in: projectIds } })
    .populate('freelancer', 'name email profileImage role')
    .sort({ createdAt: -1 })

  const stats = {
    totalProjects: projects.length,
    openProjects: projects.filter((p) => p.status === 'open').length,
    inProgressProjects: projects.filter((p) => p.status === 'in_progress').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    cancelledProjects: projects.filter((p) => p.status === 'cancelled').length,
    pendingProposals: proposals.filter((p) => p.status === 'pending').length,
    acceptedProposals: proposals.filter((p) => p.status === 'accepted').length,
    hiredFreelancers: new Set(
      projects.filter((p) => p.hiredFreelancer).map((p) => String(p.hiredFreelancer))
    ).size,
  }

  return {
    stats,
    recentProjects: projects.slice(0, 5).map((p) => p.toJSON()),
    recentNotifications: notifications.map((n) => n.toJSON()),
    recentProposals: proposals.slice(0, 5).map((p) => p.toJSON()),
    company: {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      profileImage: user?.profileImage,
      role: user?.role,
      isVerified: user?.isVerified,
      status: user?.status,
      profile: profile ? profile.toJSON() : null,
    },
  }
}
