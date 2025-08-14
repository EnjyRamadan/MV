const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  availablePoints: { type: Number, default: 100 },
  totalContacts: { type: Number, default: 0 },
  unlockedProfiles: { type: Number, default: 0 },
  myUploads: { type: Number, default: 0 }, // Changed to Number for counting uploads
  uploadedProfileIds: { type: [String], default: [] }, // Array to store actual profile IDs
  recentActivity: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Dashboard", dashboardSchema);