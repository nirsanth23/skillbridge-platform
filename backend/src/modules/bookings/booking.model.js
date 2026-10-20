import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
      index: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Session topic is required'],
      trim: true,
      minlength: [3, 'Topic must be at least 3 characters long'],
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

bookingSchema.index({ student: 1, date: 1 })
bookingSchema.index({ mentor: 1, date: 1 })
bookingSchema.index({ student: 1, status: 1 })
bookingSchema.index({ mentor: 1, status: 1 })

bookingSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  return obj
}

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
