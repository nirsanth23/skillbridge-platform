import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    reportedItemType: {
      type: String,
      required: [true, 'Reported item type is required'],
      enum: {
        values: ['user', 'project', 'proposal'],
        message: '{VALUE} is not a valid reported item type',
      },
    },
    reportedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Reported item ID is required'],
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    details: {
      type: String,
      trim: true,
      maxlength: [2000, 'Details cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'under_review', 'resolved', 'dismissed'],
        message: '{VALUE} is not a valid report status',
      },
      default: 'pending',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

reportSchema.index({ status: 1, createdAt: -1 })
reportSchema.index({ reportedItemType: 1, reportedItemId: 1 })

const Report = mongoose.model('Report', reportSchema)

export default Report
