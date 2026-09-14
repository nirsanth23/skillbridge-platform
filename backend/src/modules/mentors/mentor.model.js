import mongoose from 'mongoose'

const mentorSchema = new mongoose.Schema(
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
    expertise: {
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
    mentoringTopics: {
      type: [String],
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
    completedSessions: {
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

mentorSchema.index({ expertise: 1 })
mentorSchema.index({ rating: -1 })
mentorSchema.index({ hourlyRate: 1 })

mentorSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

const MentorProfile = mongoose.model('MentorProfile', mentorSchema)

export default MentorProfile
