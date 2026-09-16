import Notification from './notification.model.js'

/**
 * Creates a new notification for a recipient
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const createNotification = async ({
  recipient,
  type = 'general',
  title,
  message,
  relatedEntity = { entityType: 'none', entityId: null },
}) => {
  if (!recipient || !title || !message) {
    return null
  }

  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    relatedEntity,
  })

  return notification.toJSON()
}

/**
 * Retrieves notifications for a specific user with pagination
 * @param {string} userId 
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const getUserNotifications = async (userId, { page = 1, limit = 20, isRead } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20))
  const skip = (pageNum - 1) * limitNum

  const filter = { recipient: userId }
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true' || isRead === true
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ])

  return {
    notifications: notifications.map((n) => n.toJSON()),
    unreadCount,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }
}

/**
 * Marks a single notification as read (with recipient ownership verification)
 * @param {string} notificationId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  })

  if (!notification) {
    const error = new Error('Notification not found or access denied')
    error.statusCode = 404
    throw error
  }

  notification.isRead = true
  await notification.save()

  return notification.toJSON()
}

/**
 * Marks all notifications as read for a user
 * @param {string} userId 
 * @returns {Promise<{ updatedCount: number }>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  )

  return {
    updatedCount: result.modifiedCount,
  }
}
