import mongoose from 'mongoose'
import User from '../users/user.model.js'
import Project from '../projects/project.model.js'
import Proposal from '../proposals/proposal.model.js'
import FreelancerProfile from '../freelancers/freelancer.model.js'
import MentorProfile from '../mentors/mentor.model.js'
import CompanyProfile from '../companies/company.model.js'
import Notification from '../notifications/notification.model.js'
import { createNotification } from '../notifications/notification.service.js'
import Report from './report.model.js'

/**
 * Calculates aggregated, real-time platform statistics for the Admin Dashboard
 * @returns {Promise<Object>}
 */
export const getAdminDashboardData = async () => {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    deactivatedUsers,
    studentsCount,
    clientsCount,
    freelancersCount,
    mentorsCount,
    companiesCount,
    adminsCount,
    totalProjects,
    openProjects,
    inProgressProjects,
    completedProjects,
    cancelledProjects,
    draftProjects,
    totalProposals,
    pendingProposals,
    acceptedProposals,
    rejectedProposals,
    pendingVerifications,
    verifiedUsers,
    pendingReports,
    totalReports,
    recentUsers,
    recentProjects,
    recentProposals,
    recentReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'suspended' }),
    User.countDocuments({ status: 'deactivated' }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ role: 'freelancer' }),
    User.countDocuments({ role: 'mentor' }),
    User.countDocuments({ role: 'company' }),
    User.countDocuments({ role: 'admin' }),
    Project.countDocuments(),
    Project.countDocuments({ status: 'open' }),
    Project.countDocuments({ status: 'in_progress' }),
    Project.countDocuments({ status: 'completed' }),
    Project.countDocuments({ status: 'cancelled' }),
    Project.countDocuments({ status: 'draft' }),
    Proposal.countDocuments(),
    Proposal.countDocuments({ status: 'pending' }),
    Proposal.countDocuments({ status: 'accepted' }),
    Proposal.countDocuments({ status: 'rejected' }),
    User.countDocuments({ isVerified: false }),
    User.countDocuments({ isVerified: true }),
    Report.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
    Report.countDocuments(),
    User.find()
      .select('_id name email role status isVerified createdAt profileImage')
      .sort({ createdAt: -1 })
      .limit(5),
    Project.find()
      .select('_id title category budgetMin budgetMax budgetType status createdAt owner')
      .populate('owner', '_id name role email')
      .sort({ createdAt: -1 })
      .limit(5),
    Proposal.find()
      .select('_id proposedBudget estimatedDuration status createdAt project freelancer')
      .populate('freelancer', '_id name email role')
      .populate('project', '_id title status')
      .sort({ createdAt: -1 })
      .limit(5),
    Report.find()
      .populate('reporter', '_id name email role')
      .sort({ createdAt: -1 })
      .limit(5),
  ])

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      deactivated: deactivatedUsers,
      byRole: {
        student: studentsCount,
        client: clientsCount,
        freelancer: freelancersCount,
        mentor: mentorsCount,
        company: companiesCount,
        admin: adminsCount,
      },
    },
    projects: {
      total: totalProjects,
      open: openProjects,
      inProgress: inProgressProjects,
      completed: completedProjects,
      cancelled: cancelledProjects,
      draft: draftProjects,
      byStatus: {
        open: openProjects,
        in_progress: inProgressProjects,
        completed: completedProjects,
        cancelled: cancelledProjects,
        draft: draftProjects,
      },
    },
    proposals: {
      total: totalProposals,
      pending: pendingProposals,
      accepted: acceptedProposals,
      rejected: rejectedProposals,
    },
    verifications: {
      pending: pendingVerifications,
      verified: verifiedUsers,
    },
    moderation: {
      pendingReports,
      totalReports,
    },
    reports: {
      total: totalReports,
      pending: pendingReports,
    },
    recentActivity: {
      users: recentUsers.map((u) => u.toJSON()),
      projects: recentProjects.map((p) => p.toJSON()),
      proposals: recentProposals.map((pr) => pr.toJSON()),
      reports: recentReports.map((r) => r.toJSON()),
    },
  }
}

/**
 * Retrieves paginated, filtered, and searchable list of users for administration
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const getUsers = async (query = {}) => {
  const {
    search,
    role,
    status,
    isVerified,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = query

  const parsedPage = Math.max(1, parseInt(page, 10) || 1)
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const skip = (parsedPage - 1) * parsedLimit

  const filter = {}

  if (search && typeof search === 'string' && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ]
  }

  if (role && typeof role === 'string' && role.trim()) {
    filter.role = role.trim().toLowerCase()
  }

  if (status && typeof status === 'string' && status.trim()) {
    filter.status = status.trim().toLowerCase()
  }

  if (isVerified !== undefined && isVerified !== '') {
    filter.isVerified = isVerified === 'true' || isVerified === true
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select('-passwordHash')
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit),
  ])

  const totalPages = Math.ceil(total / parsedLimit) || 1

  return {
    users: users.map((u) => u.toJSON()),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: totalPages,
    },
  }
}

/**
 * Retrieves full user details including role profile and stats for admin review
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Invalid user ID format')
    error.statusCode = 400
    throw error
  }

  const user = await User.findById(userId).select('-passwordHash')
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  // Load complementary profile based on role
  let roleProfile = null
  if (user.role === 'freelancer') {
    roleProfile = await FreelancerProfile.findOne({ user: userId })
  } else if (user.role === 'mentor') {
    roleProfile = await MentorProfile.findOne({ user: userId })
  } else if (user.role === 'company') {
    roleProfile = await CompanyProfile.findOne({ user: userId })
  }

  // Activity stats
  const [projectsCount, proposalsCount] = await Promise.all([
    Project.countDocuments({ owner: userId }),
    Proposal.countDocuments({ freelancer: userId }),
  ])

  return {
    user: user.toJSON(),
    roleProfile: roleProfile ? roleProfile.toJSON() : null,
    stats: {
      projectsCount,
      proposalsCount,
    },
  }
}

/**
 * Updates an account status (activate, suspend, deactivate) with safety checks
 * @param {string} targetUserId 
 * @param {string} newStatus 
 * @param {string} adminUserId 
 * @returns {Promise<Object>}
 */
export const updateUserStatus = async (targetUserId, newStatus, adminUserId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const error = new Error('Invalid user ID format')
    error.statusCode = 400
    throw error
  }

  // Prevent an admin from changing their own account status
  if (String(targetUserId) === String(adminUserId)) {
    const error = new Error('Administrators cannot change their own account status')
    error.statusCode = 400
    throw error
  }

  const user = await User.findById(targetUserId)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  // Prevent deactivation of the last active administrator
  if (user.role === 'admin' && newStatus !== 'active') {
    const activeAdminCount = await User.countDocuments({
      role: 'admin',
      status: 'active',
      _id: { $ne: targetUserId },
    })

    if (activeAdminCount === 0) {
      const error = new Error('Cannot deactivate or suspend the last active administrator')
      error.statusCode = 400
      throw error
    }
  }

  user.status = newStatus
  await user.save()

  // Notify user of account status change
  await createNotification({
    recipient: user._id,
    type: 'system',
    title: 'Account Status Update',
    message: `Your account status has been set to ${newStatus} by platform administration.`,
  }).catch(() => {})

  const updated = await User.findById(user._id).select('-passwordHash')
  return updated.toJSON()
}

/**
 * Retrieves paginated verification requests and candidate accounts
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const getVerifications = async (query = {}) => {
  const { role, status = 'all', page = 1, limit = 10 } = query

  const parsedPage = Math.max(1, parseInt(page, 10) || 1)
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const skip = (parsedPage - 1) * parsedLimit

  const filter = {}

  if (role && typeof role === 'string' && role.trim()) {
    filter.role = role.trim().toLowerCase()
  }

  if (status === 'pending') {
    filter.isVerified = false
  } else if (status === 'verified') {
    filter.isVerified = true
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
  ])

  // Attach role profiles to verifications
  const populated = await Promise.all(
    users.map(async (u) => {
      let roleProfile = null
      if (u.role === 'freelancer') {
        roleProfile = await FreelancerProfile.findOne({ user: u._id }).select('skills hourlyRate experienceYears')
      } else if (u.role === 'mentor') {
        roleProfile = await MentorProfile.findOne({ user: u._id }).select('expertise hourlyRate experienceYears')
      } else if (u.role === 'company') {
        roleProfile = await CompanyProfile.findOne({ user: u._id }).select('companyName industry website')
      }
      return {
        ...u.toJSON(),
        roleProfile: roleProfile ? roleProfile.toJSON() : null,
      }
    })
  )

  const totalPages = Math.ceil(total / parsedLimit) || 1

  return {
    verifications: populated,
    candidates: populated,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: totalPages,
    },
  }
}

/**
 * Updates a user's verification status
 * @param {string} targetUserId 
 * @param {boolean} isVerified 
 * @param {string} adminUserId 
 * @returns {Promise<Object>}
 */
export const updateVerificationStatus = async (targetUserId, isVerified, adminUserId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const error = new Error('Invalid user ID format')
    error.statusCode = 400
    throw error
  }

  const user = await User.findById(targetUserId)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  user.isVerified = Boolean(isVerified)
  await user.save()

  // Dispatch notification to user
  await createNotification({
    recipient: user._id,
    type: 'system',
    title: isVerified ? 'Verification Approved!' : 'Verification Status Updated',
    message: isVerified
      ? 'Congratulations! Your profile has been reviewed and verified by platform administration.'
      : 'Your profile verification status has been updated.',
  }).catch(() => {})

  const updated = await User.findById(user._id).select('-passwordHash')
  return updated.toJSON()
}

/**
 * Retrieves paginated moderation reports
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const getReports = async (query = {}) => {
  const { status, reportedItemType, page = 1, limit = 10 } = query

  const parsedPage = Math.max(1, parseInt(page, 10) || 1)
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const skip = (parsedPage - 1) * parsedLimit

  const filter = {}

  if (status && typeof status === 'string' && status.trim()) {
    filter.status = status.trim().toLowerCase()
  }

  if (reportedItemType && typeof reportedItemType === 'string' && reportedItemType.trim()) {
    filter.reportedItemType = reportedItemType.trim().toLowerCase()
  }

  const [total, reports] = await Promise.all([
    Report.countDocuments(filter),
    Report.find(filter)
      .populate('reporter', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
  ])

  const totalPages = Math.ceil(total / parsedLimit) || 1

  return {
    reports: reports.map((r) => r.toJSON()),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: totalPages,
    },
  }
}

/**
 * Retrieves single report by ID
 * @param {string} reportId 
 * @returns {Promise<Object>}
 */
export const getReportById = async (reportId) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    const error = new Error('Invalid report ID format')
    error.statusCode = 400
    throw error
  }

  const report = await Report.findById(reportId)
    .populate('reporter', 'name email role')
    .populate('resolvedBy', 'name email')

  if (!report) {
    const error = new Error('Report not found')
    error.statusCode = 404
    throw error
  }

  return report.toJSON()
}

/**
 * Updates status of a moderation report
 * @param {string} reportId 
 * @param {Object} updateData 
 * @param {string} adminUserId 
 * @returns {Promise<Object>}
 */
export const updateReportStatus = async (reportId, updateData, adminUserId) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    const error = new Error('Invalid report ID format')
    error.statusCode = 400
    throw error
  }

  const report = await Report.findById(reportId)
  if (!report) {
    const error = new Error('Report not found')
    error.statusCode = 404
    throw error
  }

  report.status = updateData.status
  if (updateData.resolutionNotes !== undefined) {
    report.resolutionNotes = updateData.resolutionNotes
  }
  report.resolvedBy = adminUserId

  await report.save()

  const populated = await Report.findById(report._id)
    .populate('reporter', 'name email role')
    .populate('resolvedBy', 'name email')

  return populated.toJSON()
}

/**
 * Creates a moderation report (accessible to authenticated users or admin)
 * @param {string} reporterId 
 * @param {Object} reportData 
 * @returns {Promise<Object>}
 */
export const createReport = async (reporterId, reportData = {}) => {
  const reportedItemType = reportData.reportedItemType || reportData.targetType
  const reportedItemId = reportData.reportedItemId || reportData.targetId
  const reason = reportData.reason
  const details = reportData.details

  if (!reportedItemType || !reportedItemId || !reason) {
    const error = new Error('reportedItemType, reportedItemId, and reason are required')
    error.statusCode = 400
    throw error
  }

  if (!mongoose.Types.ObjectId.isValid(reportedItemId)) {
    const error = new Error('Invalid reported item ID format')
    error.statusCode = 400
    throw error
  }

  const report = await Report.create({
    reporter: reporterId,
    reportedItemType,
    reportedItemId,
    reason,
    details: details || '',
    status: 'pending',
  })

  const populated = await Report.findById(report._id).populate('reporter', 'name email role')
  return populated.toJSON()
}

/**
 * Calculates in-depth platform overview metrics
 * @returns {Promise<Object>}
 */
export const getPlatformOverview = async () => {
  const [
    rolesAggregation,
    projectStatusAggregation,
    projectCategoriesAggregation,
    totalUsers,
    totalProjects,
    totalProposals,
    verifiedUsersCount,
    monthlyUsers,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Project.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    User.countDocuments(),
    Project.countDocuments(),
    Proposal.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]),
  ])

  const roleDistribution = {}
  rolesAggregation.forEach((r) => {
    roleDistribution[r._id] = r.count
  })

  const projectStatusDistribution = {}
  projectStatusAggregation.forEach((p) => {
    projectStatusDistribution[p._id] = p.count
  })

  const categoryDistribution = {}
  projectCategoriesAggregation.forEach((c) => {
    categoryDistribution[c._id || 'general'] = c.count
  })

  return {
    overview: {
      totalUsers,
      totalProjects,
      totalProposals,
      verifiedUsersCount,
      roleDistribution: rolesAggregation.map((r) => ({ role: r._id, count: r.count })),
      projectDistribution: projectStatusAggregation.map((p) => ({ status: p._id, count: p.count })),
    },
    roleDistribution,
    projectStatusDistribution,
    categoryDistribution,
    recentGrowth: monthlyUsers.reverse(),
  }
}
