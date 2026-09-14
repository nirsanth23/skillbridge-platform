import mongoose from 'mongoose'

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
      default: 'My Company',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
      default: '',
    },
    companySize: {
      type: String,
      enum: {
        values: ['1-10', '11-50', '51-200', '201-500', '500+'],
        message: '{VALUE} is not a valid company size',
      },
      default: '1-10',
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

companySchema.index({ companyName: 1 })
companySchema.index({ industry: 1 })

companySchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

const CompanyProfile = mongoose.model('CompanyProfile', companySchema)

export default CompanyProfile
