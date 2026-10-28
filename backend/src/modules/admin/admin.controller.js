import * as adminService from './admin.service.js'
import {
  validateReportStatus,
  validateUserStatus,
  validateVerificationUpdate,
} from './admin.validation.js'

/**
 * GET /api/admin/dashboard
 */
export const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getAdminDashboardData()
    res.status(200).json({
      success: true,
      message: 'Admin dashboard metrics retrieved successfully',
      data: {
        ...data,
        metrics: data,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers(req.query)
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const data = await adminService.getUserById(req.params.id)
    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/users/:id/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const validation = validateUserStatus(req.body.status)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      })
    }

    const adminUserId = req.user._id || req.user.id
    const updatedUser = await adminService.updateUserStatus(
      req.params.id,
      validation.sanitized,
      adminUserId
    )

    res.status(200).json({
      success: true,
      message: `User status successfully updated to ${validation.sanitized}`,
      data: { user: updatedUser },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/verifications
 */
export const getVerifications = async (req, res, next) => {
  try {
    const data = await adminService.getVerifications(req.query)
    res.status(200).json({
      success: true,
      message: 'Verification requests retrieved successfully',
      data,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/verifications/:id/status
 * or PATCH /api/admin/users/:id/verify
 */
export const updateVerificationStatus = async (req, res, next) => {
  try {
    const validation = validateVerificationUpdate(req.body.isVerified ?? req.body.status)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      })
    }

    const adminUserId = req.user._id || req.user.id
    const updatedUser = await adminService.updateVerificationStatus(
      req.params.id,
      validation.sanitized,
      adminUserId
    )

    res.status(200).json({
      success: true,
      message: `User verification status updated to ${validation.sanitized}`,
      data: { user: updatedUser },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/reports
 */
export const getReports = async (req, res, next) => {
  try {
    const data = await adminService.getReports(req.query)
    res.status(200).json({
      success: true,
      message: 'Moderation reports retrieved successfully',
      data,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/reports/:id
 */
export const getReportById = async (req, res, next) => {
  try {
    const data = await adminService.getReportById(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Report details retrieved successfully',
      data: {
        ...data,
        report: data,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/reports/:id/status
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const validation = validateReportStatus(req.body.status, req.body.resolutionNotes)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      })
    }

    const adminUserId = req.user._id || req.user.id
    const updatedReport = await adminService.updateReportStatus(
      req.params.id,
      validation.sanitized,
      adminUserId
    )

    res.status(200).json({
      success: true,
      message: `Report status updated to ${validation.sanitized.status}`,
      data: { report: updatedReport },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/admin/reports
 */
export const createReport = async (req, res, next) => {
  try {
    const reporterId = req.user._id || req.user.id
    const report = await adminService.createReport(reporterId, req.body)
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/platform
 */
export const getPlatformOverview = async (req, res, next) => {
  try {
    const data = await adminService.getPlatformOverview()
    res.status(200).json({
      success: true,
      message: 'Platform overview metrics retrieved successfully',
      data,
    })
  } catch (error) {
    next(error)
  }
}
