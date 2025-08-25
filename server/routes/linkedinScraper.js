// routes/linkedinScraper.js - Debug version with enhanced logging
const express = require('express');
const router = express.Router();

// LinkedIn scraping endpoint
router.post('/scrape-linkedin', async (req, res) => {
  try {
    const { profilesData, userId } = req.body;
    
    console.log('=== DEBUG: Received request ===');
    console.log('Raw profilesData:', JSON.stringify(profilesData, null, 2));
    console.log('UserId:', userId);

    // Validate input
    if (!profilesData || !Array.isArray(profilesData) || profilesData.length === 0) {
      return res.status(400).json({ 
        error: 'ProfilesData array is required and cannot be empty' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // FIXED: Extract LinkedIn identifier function with better debugging
    function extractLinkedInId(url) {
      if (!url) {
        console.log('DEBUG: extractLinkedInId - URL is null/undefined');
        return null;
      }
      
      // Remove any trailing slash before matching
      const cleanUrl = url.replace(/\/$/, '');
      console.log('DEBUG: extractLinkedInId - cleanUrl:', cleanUrl);
      
      // Test multiple regex patterns to see which one works
      const patterns = [
        /linkedin\.com\/in\/([\w\-%.0-9]+)(?:[/?]|$)/i,  // Most restrictive
        /linkedin\.com\/in\/([\w\-%.]+)/i,                // Original with numbers
        /linkedin\.com\/in\/([^/?]+)/i,                   // Most permissive
      ];
      
      for (let i = 0; i < patterns.length; i++) {
        const match = cleanUrl.match(patterns[i]);
        console.log(`DEBUG: Pattern ${i + 1} (${patterns[i]}):`, match);
        if (match) {
          const id = match[1].toLowerCase();
          console.log('DEBUG: Successfully extracted LinkedIn ID:', id);
          return id;
        }
      }
      
      console.log('DEBUG: Failed to extract LinkedIn ID from URL:', cleanUrl);
      return null;
    }

    // Check for duplicates before processing
    const urlsToProcess = [];
    const duplicates = [];

    console.log('=== DEBUG: Processing profiles ===');

    for (let i = 0; i < profilesData.length; i++) {
      const profile = profilesData[i];
      console.log(`\n--- Processing profile ${i + 1} ---`);
      console.log('Profile object:', JSON.stringify(profile, null, 2));
      console.log('Profile URL:', profile.url);
      console.log('Profile URL type:', typeof profile.url);
      
      // Normalize the URL by removing trailing slash
      const normalizedUrl = profile.url ? profile.url.replace(/\/$/, '') : '';
      console.log('Normalized URL:', normalizedUrl);
      
      // Check URL format
      const hasLinkedInIn = normalizedUrl.includes('linkedin.com/in/');
      const hasLinkedInPub = normalizedUrl.includes('linkedin.com/pub/');
      console.log('Has linkedin.com/in/:', hasLinkedInIn);
      console.log('Has linkedin.com/pub/:', hasLinkedInPub);
      
      if (!normalizedUrl || (!hasLinkedInIn && !hasLinkedInPub)) {
        console.log('❌ Invalid URL format - skipping');
        continue;
      }

      const linkedinId = extractLinkedInId(normalizedUrl);
      console.log('Extracted LinkedIn ID:', linkedinId);
      
      if (!linkedinId) {
        console.log('❌ Could not extract LinkedIn ID - skipping');
        continue;
      }

      try {
        // Check if a profile with this LinkedIn ID already exists
        const existingProfile = await mongoose.model('Profile').findOne({ linkedinId });
        
        if (existingProfile) {
          console.log('🔄 Duplicate found - adding to duplicates');
          duplicates.push({
            url: profile.url,
            message: 'Profile already exists in the database'
          });
        } else {
          console.log('✅ Valid profile - adding to process queue');
          urlsToProcess.push({
            url: profile.url.trim(),
            phone: (profile.phone || '').trim(),
            email: (profile.email || '').trim(),
            extraLinks: Array.isArray(profile.extraLinks) ? profile.extraLinks.filter(Boolean) : []
          });
        }
      } catch (error) {
        console.error('Error checking for duplicate:', error);
      }
    }

    const validProfiles = urlsToProcess;
    
    console.log('\n=== DEBUG: Final validation ===');
    console.log('Total profiles to process:', validProfiles.length);
    console.log('Duplicates found:', duplicates.length);

    if (validProfiles.length === 0) {
      const error = {
        error: 'No valid LinkedIn URLs found',
        details: {
          receivedUrls: profilesData.map(p => p.url),
          validationErrors: profilesData.map(p => ({
            url: p.url,
            isValid: p.url && (p.url.includes('linkedin.com/in/') || p.url.includes('linkedin.com/pub/')),
            hasLinkedinId: extractLinkedInId(p.url) !== null
          })),
          debugInfo: {
            totalReceived: profilesData.length,
            duplicatesFound: duplicates.length,
            validProfilesCount: validProfiles.length
          }
        }
      };
      console.log('❌ VALIDATION FAILED:', JSON.stringify(error, null, 2));
      return res.status(400).json(error);
    }

    // Rest of your scraping logic continues here...
    console.log('✅ Validation passed - proceeding with scraping');
    
    // For now, just return success to test validation
    res.json({
      success: true,
      message: 'Validation passed',
      validProfiles: validProfiles.length,
      duplicates: duplicates.length
    });

  } catch (error) {
    console.error('LinkedIn scraping API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;