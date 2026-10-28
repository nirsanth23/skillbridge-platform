import mongoose from 'mongoose'
import Notification from '../notifications/notification.model.js'
import Project from '../projects/project.model.js'
import Proposal from '../proposals/proposal.model.js'
import User from '../users/user.model.js'

/**
 * Calculates aggregated, real-time dashboard data for an authenticated client user
 * @param {string} userId - Client user ObjectId
 * @returns {Promise<Object>} Aggregated client dashboard statistics & recent records
 */
export const getClientDashboardData = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Invalid user ID')
    error.statusCode = 400
    throw error
  }

  const [user, projects, notifications] = await Promise.all([
    User.findById(userId).select('name email profileImage role isVerified status createdAt'),
    Project.find({ owner: userId }).sort({ createdAt: -1 }),
    Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(10),
  ])

  if (!user) {
    const error = new Error('Client user not found')
    error.statusCode = 404
    throw error
  }

  const projectIds = projects.map((p) => p._id)

  // Find all proposals submitted on this client's projects
  const proposals = await Proposal.find({ project: { $in: projectIds } })
    .populate('freelancer', 'name profileImage role isVerified')
    .populate('project', 'title status budgetMin budgetMax budgetType deadline')
    .sort({ createdAt: -1 })

  const stats = {
    totalProjects: projects.length,
    openProjects: projects.filter((p) => p.status === 'open').length,
    inProgressProjects: projects.filter((p) => p.status === 'in_progress').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    cancelledProjects: projects.filter((p) => p.status === 'cancelled').length,
    draftProjects: projects.filter((p) => p.status === 'draft').length,
    totalProposals: proposals.length,
    pendingProposals: proposals.filter((p) => p.status === 'pending').length,
    acceptedProposals: proposals.filter((p) => p.status === 'accepted').length,
    rejectedProposals: proposals.filter((p) => p.status === 'rejected').length,
    hiredFreelancers: new Set(
      projects.filter((p) => p.hiredFreelancer).map((p) => String(p.hiredFreelancer))
    ).size,
  }

  // Populate proposal counts on recent projects
  const recentProjects = await Promise.all(
    projects.slice(0, 5).map(async (project) => {
      const proposalCount = await Proposal.countDocuments({ project: project._id })
      return {
        ...project.toJSON(),
        proposalCount,
      }
    })
  )

  return {
    client: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      isVerified: user.isVerified,
      status: user.status,
      createdAt: user.createdAt,
    },
    stats,
    // Flat top-level mirrors for convenient test/UI access
    totalProjects: stats.totalProjects,
    openProjects: stats.openProjects,
    inProgressProjects: stats.inProgressProjects,
    completedProjects: stats.completedProjects,
    cancelledProjects: stats.cancelledProjects,
    totalProposals: stats.totalProposals,
    pendingProposals: stats.pendingProposals,
    acceptedProposals: stats.acceptedProposals,
    recentProjects,
    recentProposals: proposals.slice(0, 5).map((p) => p.toJSON()),
    recentNotifications: notifications.map((n) => n.toJSON()),
  }
}
