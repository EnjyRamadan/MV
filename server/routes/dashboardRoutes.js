const express = require('express');
const Dashboard = require('../models/Dashboard');

const router = express.Router();



// GET dashboard
router.get('/:userId', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.params.userId });
    res.json(dashboard || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE or CREATE dashboard
router.post('/:userId', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOneAndUpdate(
      { userId: req.params.userId },
      {
        $set: {
          availablePoints: req.body.availablePoints,
          totalContacts: req.body.totalContacts,
          unlockedProfiles: req.body.unlockedProfiles,
          myUploads: req.body.myUploads,
          recentActivity: req.body.recentActivity,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
