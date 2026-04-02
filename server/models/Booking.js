const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    date: { type: String, required: true }, // denormalized for convenience
    time: { type: String, required: true }, // denormalized for convenience
    serviceType: {
      type: String,
      required: true,
      enum: ['driveway', 'walkway', 'full']
    },
    bookingRefId: { type: String, required: true, unique: true },
    // Booking/job lifecycle (used by owner status dashboard and admin job ticket actions)
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'en_route', 'completed', 'cancelled'],
      default: 'pending'
    },
    // Timestamps for crew/admin status changes
    enRouteAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    // Placeholder notification history (no real email/SMS yet)
    notifications: [
      {
        type: { type: String, enum: ['en_route', 'job_complete'], required: true },
        sentAt: { type: Date, required: true, default: Date.now },
        etaWindow: { type: String, default: null }, // e.g. "15-30 mins"
        completionTime: { type: Date, default: null } // completion timestamp
      }
    ]
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
