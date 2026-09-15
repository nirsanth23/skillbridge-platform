import cors from 'cors'
import express from 'express'
import errorHandler from './middleware/error.middleware.js'
import authRoutes from './modules/auth/auth.routes.js'
import companyRoutes from './modules/companies/company.routes.js'
import freelancerRoutes from './modules/freelancers/freelancer.routes.js'
import mentorRoutes from './modules/mentors/mentor.routes.js'
import projectRoutes from './modules/projects/project.routes.js'
import userRoutes from './modules/users/user.routes.js'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SkillBridge API is running',
    timestamp: new Date().toISOString(),
  })
})

// Module Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/freelancers', freelancerRoutes)
app.use('/api/mentors', mentorRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/projects', projectRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// Global Error Handler
app.use(errorHandler)

export default app
