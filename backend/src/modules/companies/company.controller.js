import * as companyService from './company.service.js'
import { validateCompanyUpdate } from './company.validation.js'

/**
 * @route   GET /api/companies/me
 * @desc    Get authenticated company's own profile
 * @access  Private (Company only)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await companyService.getCompanyProfile(req.user.id)
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
 * @route   PATCH /api/companies/me
 * @desc    Update authenticated company's own profile
 * @access  Private (Company only)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateCompanyUpdate(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const updatedProfile = await companyService.updateCompanyProfile(
      req.user.id,
      sanitized
    )

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      data: {
        profile: updatedProfile,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/companies/:id
 * @desc    Get public company profile by profile or user ID
 * @access  Public
 */
export const getCompanyById = async (req, res, next) => {
  try {
    const profile = await companyService.getCompanyById(req.params.id)
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
