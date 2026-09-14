import * as authService from './auth.service.js'
import { validateLoginInput, validateRegisterInput } from './auth.validation.js'

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateRegisterInput(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const { user, token } = await authService.registerUser(sanitized)

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateLoginInput(req.body)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
    }

    const { user, token } = await authService.loginUser(
      sanitized.email,
      sanitized.password
    )

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Authenticated)
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id)

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
 * @route   POST /api/auth/logout
 * @desc    Logout user (Stateless client token removal)
 * @access  Private (Authenticated)
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please remove your token from the client.',
  })
}
