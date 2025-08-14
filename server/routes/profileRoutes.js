const express = require('express');
const Profile = require('../models/profile.js');
const Dashboard = require('../models/Dashboard');

const router = express.Router();

// GET all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(
      profiles.map(p => ({
        ...p.toObject(),
        id: p._id.toString(),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new profile with dashboard update
router.post('/', async (req, res) => {
  try {
    // Create the profile
    const profile = await Profile.create({
      ...req.body,
      isUnlocked: false, // default
    });

    // Update dashboard for the user who uploaded
    if (req.body.uploadedBy) {
      await Dashboard.findOneAndUpdate(
        { userId: req.body.uploadedBy },
        {
          $inc: { 
            availablePoints: 10, // Add 10 points
            totalContacts: 1,    // Increment contact count
            myUploads: 1         // Increment uploads counter
          },
          $push: { 
            uploadedProfileIds: profile._id.toString(),
            recentActivity: {
              $each: [`Uploaded contact: ${req.body.name || 'Unknown'}`],
              $slice: -10 // Keep only last 10 activities
            }
          },
          updatedAt: new Date()
        },
        { upsert: true } // Create dashboard if it doesn't exist
      );
    }

    res.json({
      ...profile.toObject(),
      id: profile._id.toString(),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST bulk profiles with dashboard update
router.post('/bulk', async (req, res) => {
  try {
    const { profiles, uploadedBy } = req.body;
    
    if (!profiles || !Array.isArray(profiles)) {
      return res.status(400).json({ error: 'Invalid profiles data' });
    }

    // Create all profiles
    const createdProfiles = await Profile.insertMany(
      profiles.map(profile => ({ ...profile, isUnlocked: false }))
    );

    // Update dashboard for bulk upload
    if (uploadedBy) {
      const pointsToAdd = createdProfiles.length * 10;
      const profileIds = createdProfiles.map(p => p._id.toString());
      const activityMessages = createdProfiles.map(p => `Uploaded contact: ${p.name || 'Unknown'}`);

      await Dashboard.findOneAndUpdate(
        { userId: uploadedBy },
        {
          $inc: { 
            availablePoints: pointsToAdd,
            totalContacts: createdProfiles.length,
            myUploads: createdProfiles.length
          },
          $push: { 
            uploadedProfileIds: { $each: profileIds },
            recentActivity: {
              $each: activityMessages,
              $slice: -10
            }
          },
          updatedAt: new Date()
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      count: createdProfiles.length,
      profiles: createdProfiles.map(p => ({
        ...p.toObject(),
        id: p._id.toString(),
      }))
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;