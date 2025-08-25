// Helper function to extract LinkedIn identifier from URL
function extractLinkedInId(url) {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
  return match ? match[1].toLowerCase() : null;
}

// Helper function to check if a LinkedIn URL already exists
async function checkLinkedInDuplicate(url, Profile) {
  if (!url) return null;
  
  const linkedinId = extractLinkedInId(url);
  if (!linkedinId) return null;

  try {
    const existingProfile = await Profile.findOne({ linkedinId });
    return existingProfile ? {
      exists: true,
      message: 'A profile with this LinkedIn URL already exists'
    } : null;
  } catch (error) {
    console.error('Error checking LinkedIn duplicate:', error);
    return null;
  }
}

module.exports = {
  extractLinkedInId,
  checkLinkedInDuplicate
};
