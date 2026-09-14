import mongoose from 'mongoose'

const portfolioItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Portfolio title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    projectUrl: {
      type: String,
      trim: true,
      default: null,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    githubUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: true }
)

const freelancerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience years cannot be negative'],
      max: [70, 'Experience years cannot exceed 70'],
    },
    hourlyRate: {
      type: Number,
      default: 0,
      min: [0, 'Hourly rate cannot be negative'],
    },
    portfolio: {
      type: [portfolioItemSchema],
      default: [],
    },
    availability: {
      type: String,
      enum: {
        values: ['available', 'busy', 'not_available'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'available',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
      min: 0,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['unverified', 'pending', 'verified', 'rejected'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'unverified',
    },
  },
  {
    timestamps: true,
  }
)

freelancerSchema.index({ skills: 1 })
freelancerSchema.index({ rating: -1 })
freelancerSchema.index({ availability: 1 })

freelancerSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

const FreelancerProfile = mongoose.model('FreelancerProfile', freelancerSchema)

export default FreelancerProfile
