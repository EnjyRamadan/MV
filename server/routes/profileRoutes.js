const express = require('express');
const Profile= require ('../models/profile.js'); // your Mongoose model

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

// POST new profile
router.post('/', async (req, res) => {
  try {
    const profile = await Profile.create({
      ...req.body,
      isUnlocked: false, // default
    });

    res.json({
      ...profile.toObject(),
      id: profile._id.toString(),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

