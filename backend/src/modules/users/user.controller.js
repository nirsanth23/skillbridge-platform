import * as userService from './user.service.js'
import { validateUpdateProfileInput } from './user.validation.js'

/**
 * @route   GET /api/users/me
 * @desc    Get current authenticated user profile
 * @access  Private (Authenticated)
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id)

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/users/me
 * @desc    Update current authenticated user profile
 * @access  Private (Authenticated)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateUpdateProfileInput(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const updatedUser = await userService.updateUserProfile(
      req.user.id,
      sanitized
    )

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    next(error)
  }
}
