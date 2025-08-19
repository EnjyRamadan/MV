import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContacts } from '../contexts/ContactContext';
import { useDashboard } from '../contexts/DashboardContext';
import { Upload, FileText, Plus, User, Linkedin, Globe, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getDashboardForCurrentUser } from '../api/dashboardApi';

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const { addContact } = useContacts();
  const { dashboard, refreshDashboard } = useDashboard();

  const [activeTab, setActiveTab] = useState<'single' | 'linkedin'>('single');

  // Single upload form data
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    company: '',
    location: '',
    industry: '',
    experience: 0,
    seniorityLevel: '',
    skills: '',
    education: '',
    workExperience: '',
    email: '',
    phone: '',
    avatar: '',
  });

  // LinkedIn scraping data
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [scrapingMode, setScrapingMode] = useState<'single' | 'bulk'>('single');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<{
    total: number;
    processed: number;
    successful: number;
    failed: number;
    results: Array<{ url: string; status: 'success' | 'failed'; data?: any; error?: string }>;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const contact = {
      ...formData,
      experience: Number(formData.experience) || 0,
      skills: formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      uploadedBy: user.id,
      avatar:
        formData.avatar ||
        'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      companySize: '',
    };

    try {
      const res = await fetch('https://contactpro-backend.vercel.app/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });

      if (!res.ok) throw new Error('Failed to save contact');
      const savedContact = await res.json();

      await refreshDashboard();

      toast.success('Contact uploaded successfully! +10 points');

      setFormData({
        name: '',
        jobTitle: '',
        company: '',
        location: '',
        industry: '',
        experience: 0,
        seniorityLevel: '',
        skills: '',
        education: '',
        workExperience: '',
        email: '',
        phone: '',
        avatar: '',
      });
    } catch (error) {
      console.error('Error uploading contact:', error);
      toast.error('Failed to upload contact');
    }
  };

  // LinkedIn scraping functions
  const scrapeLinkedInProfiles = async (profileUrls: string[]) => {
    const apiToken = process.env.REACT_APP_APIFY_API_KEY;

    // Debug: Check if API key is loaded
    console.log('API Token loaded:', apiToken ? 'Yes' : 'No');
    console.log('API Token length:', apiToken?.length || 0);
    
    if (!apiToken) {
      throw new Error('API token not found. Please check your .env file.');
    }

    try {
      // First, start the actor run
      const runResponse = await fetch(`https://api.apify.com/v2/acts/supreme_coder~linkedin-profile-scraper/runs?token=${apiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          urls: profileUrls.map(url => ({ url })),
          "findContacts.contactCompassToken": ""
        })
      });

      if (!runResponse.ok) {
        throw new Error(`API request failed: ${runResponse.status} ${runResponse.statusText}`);
      }

      const runData = await runResponse.json();
      const runId = runData.data.id;

      // Wait for the run to finish
      let runStatus = 'RUNNING';
      while (runStatus === 'RUNNING') {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        const statusResponse = await fetch(`https://api.apify.com/v2/acts/supreme_coder~linkedin-profile-scraper/runs/${runId}?token=${apiToken}`);
        const statusData = await statusResponse.json();
        runStatus = statusData.data.status;
      }

      if (runStatus !== 'SUCCEEDED') {
        throw new Error(`Scraping failed with status: ${runStatus}`);
      }

      // Get the dataset items
      const datasetId = runData.data.defaultDatasetId;
      const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}`);
      
      if (!itemsResponse.ok) {
        throw new Error(`Failed to fetch results: ${itemsResponse.status} ${itemsResponse.statusText}`);
      }

      const items = await itemsResponse.json();
      return items;
    } catch (error) {
      console.error('Error scraping LinkedIn profiles:', error);
      throw error;
    }
  };

  const transformLinkedInData = (linkedInProfile: any) => {
    // Transform the LinkedIn API response to match our contact format
    if (!linkedInProfile) {
      throw new Error('No profile data received');
    }

    // Extract work experience description
    let workExperience = '';
    if (linkedInProfile.experiences && linkedInProfile.experiences.length > 0) {
      workExperience = linkedInProfile.experiences
        .map((exp: any) => `${exp.title || ''} at ${exp.company || ''}: ${exp.description || 'No description available'}`)
        .join('\n\n');
    }

    // Extract skills
    let skills: string[] = [];
    if (linkedInProfile.skills && Array.isArray(linkedInProfile.skills)) {
      skills = linkedInProfile.skills.map((skill: any) => 
        typeof skill === 'string' ? skill : skill.name || skill.title || ''
      ).filter((skill: string) => skill.trim());
    }

    // Extract education
    let education = '';
    if (linkedInProfile.educations && linkedInProfile.educations.length > 0) {
      education = linkedInProfile.educations
        .map((edu: any) => `${edu.degree || edu.fieldOfStudy || ''} at ${edu.school || ''}`)
        .filter((edu: string) => edu.trim())
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
      // Simple calculation based on first position
      const firstExperience = linkedInProfile.experiences[0];
      if (firstExperience.startDate) {
        const startYear = new Date(firstExperience.startDate).getFullYear();
        const currentYear = new Date().getFullYear();
        experienceYears = currentYear - startYear;
      }
    }

    // Determine seniority level based on job title
    const jobTitle = linkedInProfile.experiences?.[0]?.title || linkedInProfile.jobTitle || '';
    let seniorityLevel = 'Mid-level';
    const titleLower = jobTitle.toLowerCase();
    if (titleLower.includes('senior') || titleLower.includes('lead')) {
      seniorityLevel = 'Senior';
    } else if (titleLower.includes('director')) {
      seniorityLevel = 'Director';
    } else if (titleLower.includes('vp') || titleLower.includes('vice president')) {
      seniorityLevel = 'VP';
    } else if (titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('cfo')) {
      seniorityLevel = 'C-Level';
    } else if (titleLower.includes('junior') || experienceYears < 2) {
      seniorityLevel = 'Entry-level';
    }

    return {
      name: `${linkedInProfile.firstName || ''} ${linkedInProfile.lastName || ''}`.trim() || linkedInProfile.fullName || '',
      jobTitle,
      company: linkedInProfile.experiences?.[0]?.company || linkedInProfile.company || '',
      location: linkedInProfile.location || '',
      industry,
      experience: Math.max(0, experienceYears),
      seniorityLevel,
      skills,
      education,
      workExperience,
      email: linkedInProfile.email || '', // Profile might not provide email
      phone: linkedInProfile.phone || '', // Profile might not provide phone
      avatar: linkedInProfile.profilePicture || linkedInProfile.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      uploadedBy: user?.id || '',
      companySize: '',
    };
  };

  const handleLinkedInScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);
    setProcessingResults(null);

    let urlsToProcess: string[] = [];

    try {
      if (scrapingMode === 'single') {
        if (!linkedinUrl.trim()) {
          toast.error('Please enter a LinkedIn URL');
          return;
        }
        urlsToProcess = [linkedinUrl.trim()];
      } else {
        // Handle file upload
        if (!linkedinFile) {
          toast.error('Please select a file');
          return;
        }

        const fileContent = await linkedinFile.text();
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
        
        // Filter for LinkedIn URLs
        urlsToProcess = lines.filter(line => 
          line.includes('linkedin.com/in/') || line.includes('linkedin.com/pub/')
        );

        if (urlsToProcess.length === 0) {
          toast.error('No valid LinkedIn URLs found in the file');
          return;
        }
      }

      const results = {
        total: urlsToProcess.length,
        processed: 0,
        successful: 0,
        failed: 0,
        results: [] as Array<{ url: string; status: 'success' | 'failed'; data?: any; error?: string }>
      };

      setProcessingResults({ ...results });

      try {
        // Scrape all LinkedIn profiles at once
        const linkedInData = await scrapeLinkedInProfiles(urlsToProcess);

        // Process each profile result
        for (let i = 0; i < urlsToProcess.length; i++) {
          const url = urlsToProcess[i];
          const profileData = linkedInData[i];

          try {
            results.processed++;
            setProcessingResults({ ...results });

            if (!profileData) {
              throw new Error('No profile data received');
            }

            // Transform data to our format
            const contactData = transformLinkedInData(profileData);

            // Save to backend
            const res = await fetch('https://contactpro-backend.vercel.app/profiles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(contactData)
            });

            if (!res.ok) throw new Error('Failed to save contact');

            results.successful++;
            results.results.push({ url, status: 'success', data: contactData });

          } catch (error) {
            console.error(`Error processing ${url}:`, error);
            results.failed++;
            results.results.push({ 
              url, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }

          // Update results after each profile
          setProcessingResults({ ...results });
        }
      } catch (error) {
        // If the entire scraping process fails, mark all as failed
        for (const url of urlsToProcess) {
          results.processed++;
          results.failed++;
          results.results.push({ 
            url, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Scraping service failed'
          });
        }
        setProcessingResults({ ...results });
      }

      // Refresh dashboard to update points
      await refreshDashboard();

      // Show final results
      if (results.successful > 0) {
        toast.success(`Successfully processed ${results.successful} profiles! +${results.successful * 10} points`);
      }
      if (results.failed > 0) {
        toast.error(`Failed to process ${results.failed} profiles`);
      }

      // Reset form
      setLinkedinUrl('');
      setLinkedinFile(null);

    } catch (error) {
      console.error('LinkedIn scraping error:', error);
      toast.error('Failed to process LinkedIn profiles');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/plain', 'text/csv', '.txt', '.csv'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'txt' || fileExtension === 'csv' || file.type === 'text/plain' || file.type === 'text/csv') {
        setLinkedinFile(file);
      } else {
        toast.error('Please select a TXT or CSV file');
        e.target.value = '';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Contacts</h1>
        <p className="text-gray-600">
          Add new contacts manually or scrape LinkedIn profiles to earn points and grow the community database
        </p>
        {dashboard && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Current Points: {dashboard.availablePoints}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'single'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Manual Upload</span>
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'linkedin'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Linkedin className="w-5 h-5" />
            <span>LinkedIn Scraper</span>
          </button>
        </div>

        {activeTab === 'single' && (
          <form onSubmit={handleSingleUpload} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Google, Microsoft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  min={0}
                  max={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seniority Level *
                </label>
                <select
                  name="seniorityLevel"
                  value={formData.seniorityLevel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="Entry-level">Entry-level</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Director">Director</option>
                  <option value="VP">VP</option>
                  <option value="C-Level">C-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1-555-0123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma-separated) *
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. React, Node.js, Python, AWS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education *
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. BS Computer Science, Stanford University"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Experience
              </label>
              <textarea
                name="workExperience"
                value={formData.workExperience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Describe work experience, key achievements, projects, responsibilities, etc. (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Provide detailed work history, achievements, and key projects
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Upload Contact (+10 points)</span>
            </button>
          </form>
        )}

        {activeTab === 'linkedin' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <Linkedin className="w-6 h-6 text-blue-600" />
                <span>LinkedIn Profile Scraper</span>
              </h3>
              <p className="text-gray-600 mb-4">
                Extract contact information from LinkedIn profiles automatically using the supreme_coder scraper. Each successfully processed profile earns you 10 points.
              </p>
            </div>

            {/* Mode Selection */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scrapingMode"
                    value="single"
                    checked={scrapingMode === 'single'}
                    onChange={(e) => setScrapingMode(e.target.value as 'single' | 'bulk')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Single URL</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scrapingMode"
                    value="bulk"
                    checked={scrapingMode === 'bulk'}
                    onChange={(e) => setScrapingMode(e.target.value as 'single' | 'bulk')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Bulk Upload (File)</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleLinkedInScraping} className="space-y-6">
              {scrapingMode === 'single' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => {
                        let value = e.target.value.trim();
                        // Auto-add https:// if missing
                        if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
                          value = 'https://' + value;
                        }
                        setLinkedinUrl(value);
                      }}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="www.linkedin.com/in/username/ or https://www.linkedin.com/in/username/"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can enter with or without https:// - we'll add it automatically
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File with LinkedIn URLs
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleFileChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a TXT or CSV file with one LinkedIn URL per line
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Linkedin className="w-5 h-5" />
                    <span>
                      {scrapingMode === 'single' 
                        ? 'Scrape Profile (+10 points)' 
                        : 'Scrape Profiles (+10 points each)'
                      }
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Processing Results */}
            {processingResults && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Processing Results</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{processingResults.total}</div>
                    <div className="text-sm text-blue-600">Total</div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{processingResults.processed}</div>
                    <div className="text-sm text-yellow-600">Processed</div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{processingResults.successful}</div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                  <div className="bg-red-100 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{processingResults.failed}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>

                {/* Detailed Results */}
                {processingResults.results.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Detailed Results:</h5>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {processingResults.results.map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-start space-x-3 p-3 rounded-lg ${
                            result.status === 'success' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          {result.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.url}
                            </p>
                            {result.status === 'success' ? (
                              <p className="text-sm text-green-700">
                                ✓ Successfully scraped: {result.data?.name || 'Profile data extracted'}
                              </p>
                            ) : (
                              <p className="text-sm text-red-700">
                                ✗ {result.error || 'Failed to scrape profile'}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Processing...</span>
                      <span>{processingResults.processed} / {processingResults.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(processingResults.processed / processingResults.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;