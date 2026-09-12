/**
 * Global application error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || 'Field'
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400
    const errors = {}
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message
    })
    return res.status(statusCode).json({
      success: false,
      message: 'Validation failed',
      errors,
    })
  }

  // Handle CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Resource not found with id: ${err.value}`
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
  })
}

export default errorHandler
