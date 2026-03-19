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
    status: { type: String, required: true, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
