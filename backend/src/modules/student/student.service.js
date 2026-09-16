import Booking from '../bookings/booking.model.js'
import Notification from '../notifications/notification.model.js'
import Project from '../projects/project.model.js'
import Proposal from '../proposals/proposal.model.js'
import User from '../users/user.model.js'

/**
 * Calculates real-time dashboard data for a student user
 * @param {string} studentId 
 * @returns {Promise<Object>}
 */
export const getStudentDashboardData = async (studentId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Projects statistics & recent projects
  const [projects, user] = await Promise.all([
    Project.find({ owner: studentId }).sort({ createdAt: -1 }),
    User.findById(studentId).select('name email profileImage role isVerified'),
  ])

  const projectIds = projects.map((p) => p._id)

  const projectStats = {
    total: projects.length,
    open: projects.filter((p) => p.status === 'open').length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    draft: projects.filter((p) => p.status === 'draft').length,
    cancelled: projects.filter((p) => p.status === 'cancelled').length,
  }

  // 2. Proposals statistics on student's projects
  const proposals = await Proposal.find({ project: { $in: projectIds } })

  const proposalStats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  }

  // 3. Bookings statistics & upcoming booking
  const bookings = await Booking.find({ student: studentId })
    .populate('mentor', 'name email profileImage role')
    .sort({ date: 1, startTime: 1 })

  const upcomingBookings = bookings.filter(
    (b) => ['pending', 'confirmed'].includes(b.status) && new Date(b.date) >= today
  )

  const bookingStats = {
    total: bookings.length,
    upcoming: upcomingBookings.length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  const upcomingBooking = upcomingBookings[0] || null

  // 4. Recent notifications
  const recentNotifications = await Notification.find({ recipient: studentId })
    .sort({ createdAt: -1 })
    .limit(5)

  // 5. Recent projects with proposal counts
  const recentProjects = await Promise.all(
    projects.slice(0, 4).map(async (project) => {
      const proposalCount = await Proposal.countDocuments({ project: project._id })
      return {
        ...project.toJSON(),
        proposalCount,
      }
    })
  )

  return {
    student: user?.toJSON() || null,
    projectStats,
    proposalStats,
    bookingStats,
    upcomingBooking: upcomingBooking ? upcomingBooking.toJSON() : null,
    recentProjects,
    recentNotifications: recentNotifications.map((n) => n.toJSON()),
  }
}
