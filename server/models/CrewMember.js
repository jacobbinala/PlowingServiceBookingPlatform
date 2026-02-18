const mongoose = require('mongoose');

const crewMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ['Driver', 'Admin'] },
    active: { type: Boolean, default: true },
    password: { type: String, required: true }, // hashed password
  },
  { timestamps: true }
);

module.exports = mongoose.model('CrewMember', crewMemberSchema);
