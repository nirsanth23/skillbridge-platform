import mongoose from 'mongoose'

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
      index: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer is required'],
      index: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [10, 'Cover letter must be at least 10 characters'],
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    proposedBudget: {
      type: Number,
      required: [true, 'Proposed budget is required'],
      min: [0, 'Proposed budget cannot be negative'],
    },
    estimatedDuration: {
      type: String,
      required: [true, 'Estimated duration is required'],
      trim: true,
      maxlength: [100, 'Estimated duration cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid proposal status',
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true })
proposalSchema.index({ project: 1, status: 1 })
proposalSchema.index({ freelancer: 1, createdAt: -1 })

proposalSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

const Proposal = mongoose.model('Proposal', proposalSchema)

export default Proposal
