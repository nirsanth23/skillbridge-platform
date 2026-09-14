import * as mentorService from './mentor.service.js'
import { validateMentorUpdate } from './mentor.validation.js'

/**
 * @route   GET /api/mentors/me
 * @desc    Get authenticated mentor's own profile
 * @access  Private (Mentor only)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await mentorService.getMentorProfile(req.user.id)
    return res.status(200).json({
      success: true,
      data: {
        profile,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/mentors/me
 * @desc    Update authenticated mentor's own profile
 * @access  Private (Mentor only)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateMentorUpdate(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const updatedProfile = await mentorService.updateMentorProfile(
      req.user.id,
      sanitized
    )

    return res.status(200).json({
      success: true,
      message: 'Mentor profile updated successfully',
      data: {
        profile: updatedProfile,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/mentors/:id
 * @desc    Get public mentor profile by profile or user ID
 * @access  Public
 */
export const getMentorById = async (req, res, next) => {
  try {
    const profile = await mentorService.getMentorById(req.params.id)
    return res.status(200).json({
      success: true,
      data: {
        profile,
      },
    })
  } catch (error) {
    next(error)
  }
}
