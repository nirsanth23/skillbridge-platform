import * as freelancerService from './freelancer.service.js'
import { validateFreelancerUpdate } from './freelancer.validation.js'

/**
 * @route   GET /api/freelancers/me
 * @desc    Get authenticated freelancer's own profile
 * @access  Private (Freelancer only)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await freelancerService.getFreelancerProfile(req.user.id)
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
 * @route   PATCH /api/freelancers/me
 * @desc    Update authenticated freelancer's own profile
 * @access  Private (Freelancer only)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateFreelancerUpdate(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const updatedProfile = await freelancerService.updateFreelancerProfile(
      req.user.id,
      sanitized
    )

    return res.status(200).json({
      success: true,
      message: 'Freelancer profile updated successfully',
      data: {
        profile: updatedProfile,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/freelancers/:id
 * @desc    Get public freelancer profile by profile or user ID
 * @access  Public
 */
export const getFreelancerById = async (req, res, next) => {
  try {
    const profile = await freelancerService.getFreelancerById(req.params.id)
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
