import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [5, 'Project title must be at least 5 characters'],
      maxlength: [150, 'Project title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      minlength: [10, 'Project description must be at least 10 characters'],
      maxlength: [5000, 'Project description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          return Array.isArray(skills) && skills.every((s) => typeof s === 'string' && s.trim().length > 0)
        },
        message: 'Skills must be an array of non-empty strings',
      },
    },
    budgetType: {
      type: String,
      enum: {
        values: ['fixed', 'hourly'],
        message: '{VALUE} is not a valid budget type',
      },
      default: 'fixed',
    },
    budgetMin: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative'],
      default: 0,
    },
    budgetMax: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative'],
      default: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
    projectType: {
      type: String,
      enum: {
        values: ['individual', 'company'],
        message: '{VALUE} is not a valid project type',
      },
      default: 'individual',
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'open', 'in_progress', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'open',
      index: true,
    },
    attachments: {
      type: [
        {
          name: { type: String, trim: true },
          url: { type: String, trim: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

projectSchema.index({ category: 1 })
projectSchema.index({ status: 1, createdAt: -1 })
projectSchema.index({ owner: 1, createdAt: -1 })

projectSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

const Project = mongoose.model('Project', projectSchema)

export default Project
