/**
 * Middleware for Role-Based Access Control (RBAC)
 * @param  {...string} roles Allowed roles for the route
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role authorization.',
      })
    }

    // Normalize roles to lowercase for robust matching
    const allowedRoles = roles.map((r) => r.toLowerCase())
    const userRole = (req.user.role || '').toLowerCase()

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: '${req.user.role}' role is not authorized to access this resource.`,
      })
    }

    next()
  }
}

export default authorizeRoles
