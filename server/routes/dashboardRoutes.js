const express = require('express');
const Dashboard = require('../models/Dashboard');
const Profile = require('../models/profile');

const router = express.Router();

// GET dashboard with calculated stats
router.get('/:userId', async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne({ userId: req.params.userId });
    
    // If no dashboard exists, create one with defaults
    if (!dashboard) {
      dashboard = await Dashboard.create({
        userId: req.params.userId,
        availablePoints: 100,
        totalContacts: 0,
        unlockedProfiles: 0,
        myUploads: 0,
        uploadedProfileIds: [],
        unlockedContactIds: [],
        recentActivity: []
      });
    }

    // Calculate actual stats from database to ensure accuracy
    const actualUploads = await Profile.countDocuments({ uploadedBy: req.params.userId });
    const actualUnlockedCount = dashboard.unlockedContactIds ? dashboard.unlockedContactIds.length : 0;
    
    // Update dashboard with accurate counts if they don't match
    if (dashboard.myUploads !== actualUploads || dashboard.unlockedProfiles !== actualUnlockedCount) {
      dashboard.myUploads = actualUploads;
      dashboard.unlockedProfiles = actualUnlockedCount;
      dashboard.totalContacts = actualUploads; // Total contacts user has contributed
      await dashboard.save();
    }

    res.json(dashboard);
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE or CREATE dashboard
router.post('/:userId', async (req, res) => {
  try {
    const updateData = {
      availablePoints: req.body.availablePoints,
      totalContacts: req.body.totalContacts,
      unlockedProfiles: req.body.unlockedProfiles,
      myUploads: req.body.myUploads,
      unlockedContactIds: req.body.unlockedContactIds || [],
      uploadedProfileIds: req.body.uploadedProfileIds || [],
      recentActivity: req.body.recentActivity || [],
      updatedAt: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const dashboard = await Dashboard.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    res.json(dashboard);
  } catch (err) {
    console.error('Dashboard update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET user's unlocked contacts with detailed info
router.get('/:userId/unlocked', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.params.userId });
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    // Get detailed info about unlocked contacts
    const unlockedProfiles = await Profile.find({
      '_id': { $in: dashboard.unlockedContactIds || [] }
    }).select('name jobTitle company uploadedAt');
    
    res.json({
      userId: req.params.userId,
      unlockedContactIds: dashboard.unlockedContactIds || [],
      totalUnlocked: dashboard.unlockedProfiles || 0,
      actualUnlockedCount: dashboard.unlockedContactIds ? dashboard.unlockedContactIds.length : 0,
      unlockedProfiles
    });
  } catch (err) {
    console.error('Unlocked contacts fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET user's activity summary
router.get('/:userId/activity', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.params.userId });
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    // Get detailed activity information
    const uploadedProfiles = await Profile.find({
      'uploadedBy': req.params.userId
    }).sort({ uploadedAt: -1 }).limit(10).select('name jobTitle company uploadedAt');

    const recentActivity = dashboard.recentActivity || [];
    
    res.json({
      recentActivity: recentActivity.slice(-10).reverse(), // Most recent first
      uploadedProfiles,
      totalActivities: recentActivity.length,
      lastUpdated: dashboard.updatedAt
    });
  } catch (err) {
    console.error('Activity fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Add activity (helper endpoint)
router.patch('/:userId/activity', async (req, res) => {
  try {
    const { activity } = req.body;
    
    if (!activity) {
      return res.status(400).json({ error: 'Activity message required' });
    }

    const dashboard = await Dashboard.findOneAndUpdate(
      { userId: req.params.userId },
      {
        $push: {
          recentActivity: {
            $each: [activity],
            $slice: -20 // Keep only last 20 activities
          }
        },
        $set: { updatedAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      activity: activity,
      totalActivities: dashboard.recentActivity.length
    });
  } catch (err) {
    console.error('Add activity error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;