const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceRef: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    bookingRefId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'CAD' },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    dueDate: { type: Date, default: null },
    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
);

invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
