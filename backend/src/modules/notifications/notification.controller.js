import * as notificationService from './notification.service.js'

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotifications(req.user.id, req.query)
    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markNotificationAsRead(
      req.params.id,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all user's notifications as read
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllNotificationsAsRead(req.user.id)
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
