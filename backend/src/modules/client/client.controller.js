import * as clientService from './client.service.js'

/**
 * Controller to retrieve authenticated client dashboard statistics and recent records
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id
    const dashboardData = await clientService.getClientDashboardData(userId)

    res.status(200).json({
      success: true,
      message: 'Client dashboard data retrieved successfully',
      data: dashboardData,
    })
  } catch (error) {
    next(error)
  }
}
