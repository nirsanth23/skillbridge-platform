import dotenv from 'dotenv'
import http from 'http'
import app from './app.js'
import connectDB from './config/db.js'

dotenv.config()

const PORT = process.env.PORT || 5001
const server = http.createServer(app)

// Connect to MongoDB Atlas if MONGODB_URI is provided
if (process.env.MONGODB_URI && process.env.NODE_ENV !== 'test') {
  connectDB()
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
