// routes/linkedinScraper.js
const express = require('express');
const router = express.Router();

// LinkedIn scraping endpoint
router.post('/scrape-linkedin', async (req, res) => {
  try {
    const { urls, userId } = req.body;

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'URLs array is required and cannot be empty' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Validate URLs
    const validUrls = urls.filter(url => 
      url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/')
    );

    if (validUrls.length === 0) {
      return res.status(400).json({ 
        error: 'No valid LinkedIn URLs found' 
      });
    }

    const apiToken = process.env.APIFY_API_KEY;
    
    if (!apiToken) {
      return res.status(500).json({ 
        error: 'LinkedIn scraping service not configured' 
      });
    }

    // Initialize results tracking
    const results = {
      total: validUrls.length,
      processed: 0,
      successful: 0,
      failed: 0,
      results: []
    };

    console.log(`Starting LinkedIn scraping for ${validUrls.length} URLs`);

    try {
      // Start the Apify actor run
      const runResponse = await fetch(`https://api.apify.com/v2/acts/supreme_coder~linkedin-profile-scraper/runs?token=${apiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          urls: validUrls.map(url => ({ url })),
          "findContacts.contactCompassToken": ""
        })
      });

      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        console.error('Apify run failed:', runResponse.status, errorText);
        throw new Error(`LinkedIn scraping service failed: ${runResponse.status}`);
      }

      const runData = await runResponse.json();
      const runId = runData.data.id;

      console.log(`Apify run started with ID: ${runId}`);

      // Poll for completion
      let runStatus = 'RUNNING';
      let attempts = 0;
      const maxAttempts = 60; // 3 minutes max wait time

      while (runStatus === 'RUNNING' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        const statusResponse = await fetch(`https://api.apify.com/v2/acts/supreme_coder~linkedin-profile-scraper/runs/${runId}?token=${apiToken}`);
        
        if (!statusResponse.ok) {
          throw new Error('Failed to check scraping status');
        }

        const statusData = await statusResponse.json();
        runStatus = statusData.data.status;
        attempts++;

        console.log(`Scraping status: ${runStatus} (attempt ${attempts})`);
      }

      if (runStatus !== 'SUCCEEDED') {
        throw new Error(`Scraping failed with status: ${runStatus}`);
      }

      // Get the scraped data
      const datasetId = runData.data.defaultDatasetId;
      const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}`);
      
      if (!itemsResponse.ok) {
        throw new Error(`Failed to fetch scraping results: ${itemsResponse.status}`);
      }

      const scrapedData = await itemsResponse.json();
      console.log(`Received ${scrapedData.length} scraped profiles`);

      // Process each scraped profile
      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i];
        const profileData = scrapedData[i];

        try {
          results.processed++;

          if (!profileData) {
            throw new Error('No profile data received');
          }

          // Transform LinkedIn data to our contact format
          const contactData = transformLinkedInData(profileData, userId);

          // Save contact to database
          const Profile = require('../models/Profile'); // Adjust path as needed
          const savedContact = await Profile.create(contactData);

          results.successful++;
          results.results.push({ 
            url, 
            status: 'success', 
            data: {
              name: contactData.name,
              jobTitle: contactData.jobTitle,
              company: contactData.company
            }
          });

          console.log(`Successfully processed profile: ${contactData.name}`);

        } catch (error) {
          console.error(`Error processing ${url}:`, error);
          results.failed++;
          results.results.push({ 
            url, 
            status: 'failed', 
            error: error.message
          });
        }
      }

    } catch (scrapingError) {
      console.error('Scraping service error:', scrapingError);
      
      // Mark all URLs as failed if scraping service fails
      for (const url of validUrls) {
        results.processed++;
        results.failed++;
        results.results.push({ 
          url, 
          status: 'failed', 
          error: 'LinkedIn scraping service failed'
        });
      }
    }

    // Update user points
    if (results.successful > 0) {
      try {
        const User = require('../models/User'); // Adjust path as needed
        await User.findByIdAndUpdate(userId, {
          $inc: { points: results.successful * 10 }
        });
        console.log(`Added ${results.successful * 10} points to user ${userId}`);
      } catch (pointsError) {
        console.error('Error updating user points:', pointsError);
        // Don't fail the entire operation for points update failure
      }
    }

    // Return results
    res.json({
      success: true,
      results,
      pointsEarned: results.successful * 10
    });

  } catch (error) {
    console.error('LinkedIn scraping API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Helper function to transform LinkedIn data
function transformLinkedInData(linkedInProfile, userId) {
  if (!linkedInProfile) {
    throw new Error('No profile data received');
  }

  // Extract work experience description
  let workExperience = '';
  if (linkedInProfile.experiences && linkedInProfile.experiences.length > 0) {
    workExperience = linkedInProfile.experiences
      .map(exp => `${exp.title || ''} at ${exp.company || ''}: ${exp.description || 'No description available'}`)
      .join('\n\n');
  }

  // Extract skills
  let skills = [];
  if (linkedInProfile.skills && Array.isArray(linkedInProfile.skills)) {
    skills = linkedInProfile.skills.map(skill => 
      typeof skill === 'string' ? skill : skill.name || skill.title || ''
    ).filter(skill => skill.trim());
  }

  // Extract education
  let education = '';
  if (linkedInProfile.educations && linkedInProfile.educations.length > 0) {
    education = linkedInProfile.educations
      .map(edu => `${edu.degree || edu.fieldOfStudy || ''} at ${edu.school || ''}`)
      .filter(edu => edu.trim())
      .join('; ');
  }

  // Determine industry from profile data
  let industry = linkedInProfile.industry || 'Other';
  if (linkedInProfile.experiences && linkedInProfile.experiences.length > 0) {
    const currentExperience = linkedInProfile.experiences[0];
    if (currentExperience.companyIndustry) {
      industry = currentExperience.companyIndustry;
    }
  }

  // Calculate experience years
  let experienceYears = 0;
  if (linkedInProfile.experiences && linkedInProfile.experiences.length > 0) {
    const firstExperience = linkedInProfile.experiences[0];
    if (firstExperience.startDate) {
      const startYear = new Date(firstExperience.startDate).getFullYear();
      const currentYear = new Date().getFullYear();
      experienceYears = Math.max(0, currentYear - startYear);
    }
  }

  // Determine seniority level based on job title
  const jobTitle = linkedInProfile.experiences?.[0]?.title || linkedInProfile.jobTitle || '';
  let seniorityLevel = 'Mid-level';
  const titleLower = jobTitle.toLowerCase();
  
  if (titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('cfo') || titleLower.includes('chief')) {
    seniorityLevel = 'C-Level';
  } else if (titleLower.includes('vp') || titleLower.includes('vice president')) {
    seniorityLevel = 'VP';
  } else if (titleLower.includes('director')) {
    seniorityLevel = 'Director';
  } else if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
    seniorityLevel = 'Senior';
  } else if (titleLower.includes('junior') || experienceYears < 2) {
    seniorityLevel = 'Entry-level';
  }

  return {
    name: `${linkedInProfile.firstName || ''} ${linkedInProfile.lastName || ''}`.trim() || linkedInProfile.fullName || '',
    jobTitle,
    company: linkedInProfile.experiences?.[0]?.company || linkedInProfile.company || '',
    location: linkedInProfile.location || '',
    industry,
    experience: experienceYears,
    seniorityLevel,
    skills,
    education,
    workExperience,
    email: linkedInProfile.email || '', // Profile might not provide email
    phone: linkedInProfile.phone || '', // Profile might not provide phone
    avatar: linkedInProfile.profilePicture || linkedInProfile.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    uploadedBy: userId,
    companySize: linkedInProfile.companySize || '',
    linkedinUrl: linkedInProfile.url || linkedInProfile.linkedinUrl || ''
  };
}

module.exports = router;