import mongoose from 'mongoose'
import Booking from '../bookings/booking.model.js'
import Notification from '../notifications/notification.model.js'
import User from '../users/user.model.js'
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
  }).populate('user', 'name email profileImage role isVerified')

  if (!profile) {
    const error = new Error('Mentor profile not found')
    error.statusCode = 404
    throw error
  }

  return profile.toJSON()
}

/**
 * Retrieves paginated list of mentors with filtering, searching and sorting
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const getMentors = async (query = {}) => {
  const {
    search,
    expertise,
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

  if (expertise) {
    filter.expertise = { $regex: new RegExp(expertise.trim(), 'i') }
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

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i')
    filter.$or = [
      { bio: searchRegex },
      { expertise: searchRegex },
      { mentoringTopics: searchRegex },
    ]
  }

  const sort = {}
  const order = sortOrder === 'asc' ? 1 : -1
  if (sortBy === 'experience') {
    sort.experienceYears = order
  } else if (sortBy === 'hourlyRate') {
    sort.hourlyRate = order
  } else if (sortBy === 'createdAt') {
    sort.createdAt = order
  } else {
    sort.rating = order
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12))
  const skip = (pageNum - 1) * limitNum

  const [mentors, total] = await Promise.all([
    MentorProfile.find(filter)
      .populate('user', 'name email profileImage role isVerified')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    MentorProfile.countDocuments(filter),
  ])

  return {
    mentors: mentors.map((m) => m.toJSON()),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }
}

/**
 * Calculates aggregated dashboard data for the authenticated mentor
 * @param {string} mentorId - Mentor's User ObjectId
 * @returns {Promise<Object>} Aggregated dashboard statistics
 */
export const getMentorDashboardData = async (mentorId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [bookings, profile, user, notifications] = await Promise.all([
    Booking.find({ mentor: mentorId })
      .populate('student', 'name email profileImage role')
      .sort({ date: 1, startTime: 1 }),
    MentorProfile.findOne({ user: mentorId }),
    User.findById(mentorId).select('name email profileImage role isVerified'),
    Notification.find({ recipient: mentorId }).sort({ createdAt: -1 }).limit(5),
  ])

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
  }

  // Next upcoming confirmed session
  const upcomingSession =
    bookings.find(
      (b) => b.status === 'confirmed' && new Date(b.date) >= today
    ) || null

  // Recent incoming requests (pending)
  const recentRequests = bookings
    .filter((b) => b.status === 'pending')
    .slice(0, 5)

  // Recent confirmed / completed / other sessions
  const recentSessions = bookings
    .filter((b) => b.status !== 'pending')
    .slice(0, 5)

  return {
    mentor: {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      profileImage: user?.profileImage,
      isVerified: user?.isVerified,
      availability: profile?.availability || 'available',
      hourlyRate: profile?.hourlyRate || 0,
      experienceYears: profile?.experienceYears || 0,
      rating: profile?.rating || 0,
      reviewCount: profile?.reviewCount || 0,
      completedSessions: profile?.completedSessions || 0,
      expertise: profile?.expertise || [],
      mentoringTopics: profile?.mentoringTopics || [],
      bio: profile?.bio || '',
    },
    bookingStats,
    upcomingSession,
    recentRequests,
    recentSessions,
    recentNotifications: notifications.map((n) => n.toJSON()),
  }
}


