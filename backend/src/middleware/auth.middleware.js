import jwt from 'jsonwebtoken'
import User from '../modules/users/user.model.js'

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      })
    }

    const secret = process.env.JWT_SECRET || 'skillbridge_default_jwt_secret'

    let decoded
    try {
      decoded = jwt.verify(token, secret)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
        })
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authentication failed.',
      })
    }

    // Verify user exists and is active in database
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      })
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Access denied.`,
      })
    }

    // Attach user payload to request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    }

    next()
  } catch (error) {
    next(error)
  }
}

export default authenticate
