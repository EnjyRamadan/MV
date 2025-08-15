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
          unlockedContactIds: req.body.unlockedContactIds || [], // Support new field
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

// GET user's unlocked contacts (useful for debugging/admin)
router.get('/:userId/unlocked', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.params.userId });
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    res.json({
      userId: req.params.userId,
      unlockedContactIds: dashboard.unlockedContactIds || [],
      totalUnlocked: dashboard.unlockedProfiles || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;