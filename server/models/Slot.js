const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD (local/business date)
    time: { type: String, required: true }, // HH:mm
    capacity: { type: Number, required: true, default: 1, min: 1 },
    bookedCount: { type: Number, required: true, default: 0, min: 0 }
  },
  { timestamps: true }
);

slotSchema.index({ date: 1, time: 1 }, { unique: true });

slotSchema.virtual('isFullyBooked').get(function () {
  return this.bookedCount >= this.capacity;
});

slotSchema.set('toJSON', { virtuals: true });
slotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Slot', slotSchema);
