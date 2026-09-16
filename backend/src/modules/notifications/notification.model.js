import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'proposal_received',
        'proposal_accepted',
        'proposal_rejected',
        'booking_created',
        'booking_status_changed',
        'booking_cancelled',
        'project_status_changed',
        'general',
      ],
      default: 'general',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['project', 'proposal', 'booking', 'user', 'none'],
        default: 'none',
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1 })

notificationSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
