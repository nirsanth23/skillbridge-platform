import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['student', 'client', 'freelancer', 'mentor', 'company', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
    },
    profileImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['active', 'suspended', 'deactivated'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for role and status compound query lookups
userSchema.index({ role: 1, status: 1 })

// Method to compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash)
}

// Transform output JSON to safely omit sensitive internal fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  delete obj.__v
  return obj
}

const User = mongoose.model('User', userSchema)

export default User
