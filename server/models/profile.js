const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    name: String,
    jobTitle: String,
    company: String,
    location: String,
    industry: String,
    experience: Number,
    seniorityLevel: String,
    skills: [String],
    education: String,
    email: String,
    phone: String,
    avatar: String,
    // Remove global isUnlocked - now tracked per user in Dashboard
    uploadedBy: String,
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Profile', profileSchema);