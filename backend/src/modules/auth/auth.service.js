import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../users/user.model.js'

/**
 * Generates signed JWT authentication token
 * @param {Object} user 
 * @returns {string} Signed JWT
 */
export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'skillbridge_default_jwt_secret'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  )
}

/**
 * Registers a new user account
 * @param {Object} data 
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const registerUser = async ({ name, email, password, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    const error = new Error('Email is already registered')
    error.statusCode = 409
    throw error
  }

  // Hash password using bcryptjs
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)

  // Create new user
  const newUser = await User.create({
    name,
    email,
    passwordHash,
    role,
    status: 'active',
    isVerified: false,
  })

  // Generate JWT token
  const token = generateToken(newUser)

  return {
    user: newUser.toJSON(),
    token,
  }
}

/**
 * Authenticates user credentials and returns token
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const loginUser = async (email, password) => {
  // Find user by email including hidden passwordHash
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  // Check account status
  if (user.status === 'suspended') {
    const error = new Error('Your account has been suspended. Please contact support.')
    error.statusCode = 403
    throw error
  }

  if (user.status === 'deactivated') {
    const error = new Error('Your account is deactivated. Please contact support to reactivate.')
    error.statusCode = 403
    throw error
  }

  // Verify password with bcrypt
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  // Generate token
  const token = generateToken(user)

  return {
    user: user.toJSON(),
    token,
  }
}

/**
 * Retrieves the currently authenticated user
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }
  return user.toJSON()
}
