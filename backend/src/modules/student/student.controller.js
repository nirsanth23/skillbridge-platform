import * as studentService from './student.service.js'

/**
 * @route   GET /api/student/dashboard
 * @desc    Get real-time dashboard stats for authenticated student
 * @access  Private (Role: student)
 */
export const getDashboard = async (req, res, next) => {
  try {
    const data = await studentService.getStudentDashboardData(req.user.id)
    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}
