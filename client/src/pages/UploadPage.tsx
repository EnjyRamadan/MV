import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContacts } from '../contexts/ContactContext';
import { useDashboard } from '../contexts/DashboardContext';
import { Upload, FileText, Plus, User, Linkedin, Globe, AlertCircle, CheckCircle, Loader,Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const { addContact, refreshContacts } = useContacts();
  const { dashboard, refreshDashboard } = useDashboard();

  const [activeTab, setActiveTab] = useState<'single' | 'linkedin'>('linkedin');

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
    linkedinUrl: '',
    extraLinks: '',  // Will be split into array when submitting
  });

  // LinkedIn scraping data
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [scrapingMode, setScrapingMode] = useState<'single' | 'bulk'>('single');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Contact info for LinkedIn scraping
  const [linkedinExtraLinks, setLinkedinExtraLinks] = useState('');
  const [linkedinPhone, setLinkedinPhone] = useState('');
  const [linkedinEmail, setLinkedinEmail] = useState('');

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
      extraLinks: formData.extraLinks
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

      await Promise.all([
        refreshDashboard(),
        refreshContacts()
      ]);

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
        linkedinUrl: '',
        extraLinks: '',
      });
    } catch (error) {
      console.error('Error uploading contact:', error);
      toast.error('Failed to upload contact');
    }
  };

  const handleLinkedInScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);
    setProcessingResults(null);

    let processedData: Array<{ url: string; phone?: string; email: string;extraLinks?: string[] }> = [];

    try {
      if (scrapingMode === 'single') {
        if (!linkedinUrl.trim()) {
          toast.error('Please enter a LinkedIn URL');
          return;
        }
        processedData = [{
          url: linkedinUrl.trim(),
          phone: linkedinPhone.trim(),
          email: linkedinEmail.trim(),
          extraLinks: linkedinExtraLinks ? linkedinExtraLinks.split(',').map(s => s.trim()).filter(Boolean) : []
        }];
      } else {
        // Handle CSV file upload
        if (!linkedinFile) {
          toast.error('Please select a CSV file');
          return;
        }

        const fileContent = await linkedinFile.text();
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        // Parse CSV headers
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const urlIndex = headers.findIndex(h => h.includes('url'));
        const phoneIndex = headers.findIndex(h => h.includes('phone'));
        const emailIndex = headers.findIndex(h => h.includes('email'));
        const extraLinksIndex = headers.findIndex(h => h.includes('links'));

        if (urlIndex === -1) {
          toast.error('CSV file must have a "url" column');
          return;
        }

        // Parse CSV data
        const dataRows = lines.slice(1); // Skip header row
        processedData = dataRows.map(row => {
        const columns = row.split(',').map(col => col.trim().replace(/"/g, ''));

        // get links column for this row
        const linksRaw = extraLinksIndex !== -1 ? columns[extraLinksIndex] || '' : '';

        return {
          url: columns[urlIndex] || '',
          phone: phoneIndex !== -1 ? columns[phoneIndex] || '' : '',
          email: emailIndex !== -1 ? columns[emailIndex] || '' : '',
          extraLinks: linksRaw
            .split(',')
            .map(s => s.trim())
            .filter(Boolean) // removes empty entries
        };
      }).filter(item => 
        item.url && (item.url.includes('linkedin.com/in/') || item.url.includes('linkedin.com/pub/'))
      );


        if (processedData.length === 0) {
          toast.error('No valid LinkedIn URLs found in the CSV file');
          return;
        }

      }

      // Initialize processing results
      const initialResults = {
        total: processedData.length,
        processed: 0,
        successful: 0,
        failed: 0,
        results: []
      };
      setProcessingResults(initialResults);

      // Call backend API for LinkedIn scraping with phone info
      const response = await fetch('https://contactpro-backend.vercel.app/api/scrape-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilesData: processedData,
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Update processing results with final data
      setProcessingResults(result.results);

      // Refresh dashboard and contacts
      await Promise.all([
        refreshDashboard(),
        refreshContacts()
      ]);

      // Show success/failure messages
      if (result.results.successful > 0) {
        toast.success(`Successfully processed ${result.results.successful} profiles! +${result.pointsEarned} points`);
      }
      if (result.results.failed > 0) {
        toast.error(`Failed to process ${result.results.failed} profiles`);
      }

      // Reset form
      setLinkedinUrl('');
      setLinkedinPhone('');
      setLinkedinEmail('');
      setLinkedinExtraLinks('');
      setLinkedinFile(null);

    } catch (error) {
      console.error('LinkedIn scraping error:', error);
      
      // Update results to show all failed
      if (processedData.length > 0) {
        const failedResults = {
          total: processedData.length,
          processed: processedData.length,
          successful: 0,
          failed: processedData.length,
          results: processedData.map(item => ({
            url: item.url,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
          }))
        };
        setProcessingResults(failedResults);
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to process LinkedIn profiles');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only CSV for structured data
      const validTypes = ['text/csv', 'application/vnd.ms-excel'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv' || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
        setLinkedinFile(file);
      } else {
        toast.error('Please select a CSV file');
        e.target.value = '';
      }
    }
  };
    const exampleCSV = `url,phone,email,links
    https://www.linkedin.com/in/johnsmith/,+1-555-0001,john@example.com,"https://a.com,https://b.com"
    https://www.linkedin.com/in/janedoe/,+1-555-0002,jane@example.com,"https://c.com,https://d.com"
    https://www.linkedin.com/in/mikejohnson/,+1-555-0003,mike@example.com,"https://e.com,https://f.com"`;



    const downloadExample = () => {
      const blob = new Blob([exampleCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "example.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
                  Company 
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Google, Microsoft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location 
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry 
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
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
                  Years of Experience 
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min={0}
                  max={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seniority Level 
                </label>
                <select
                  name="seniorityLevel"
                  value={formData.seniorityLevel}
                  onChange={handleInputChange}
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
                  Email 
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                Skills (comma-separated) 
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. React, Node.js, Python, AWS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education 
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. https://www.linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Links (comma-separated)
              </label>
              <input
                type="text"
                name="extraLinks"
                value={formData.extraLinks}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. https://github.com/username, https://twitter.com/username"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add any additional profile links separated by commas
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0b07f0] to-[#0b07f0] text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 hover:brightness-110 hover:scale-105 hover:shadow-lg"
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
                Extract contact information from LinkedIn profiles automatically. Each successfully processed profile earns you 10 points.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Enter LinkedIn profile URL along with phone number</li>
                      <li>Upload a CSV file with URLs and phone numbers for bulk processing</li>
                      <li>Our backend service will scrape the profiles securely</li>
                      <li>Your provided phone number will be used if not available on LinkedIn</li>
                      <li>You earn 10 points for each successfully processed profile</li>
                    </ul>
                  </div>
                </div>
              </div>
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
                  <span className="text-sm font-medium text-gray-700">Single URL with Phone</span>
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
                  <span className="text-sm font-medium text-gray-700">Bulk Upload (CSV File)</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleLinkedInScraping} className="space-y-6">
              {scrapingMode === 'single' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile URL *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={linkedinPhone}
                      onChange={(e) => setLinkedinPhone(e.target.value)}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1-555-0123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={linkedinEmail}
                      onChange={(e) => setLinkedinEmail(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extra Links (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={linkedinExtraLinks}
                      onChange={(e) => setLinkedinExtraLinks(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., https://github.com/username, https://twitter.com/username"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add any additional profile links separated by commas
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File with LinkedIn URLs and Phone Numbers
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a CSV file with the following format (headers required):
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                    <div className="font-semibold mb-1">CSV Format:</div>
                    <div>url,phone,links</div>
                    <div>https://www.linkedin.com/in/johnsmith/,+1-555-0001,https://a.com,https://b.com</div>
                    <div>https://www.linkedin.com/in/janedoe/,+1-555-0002,https://c.com,https://d.com</div>
                    <div>https://www.linkedin.com/in/mikejohnson/,+1-555-0003,https://e.com,https://f.com</div>
                  </div>

                  <div className="mb-6">
                    <button 
                      onClick={downloadExample}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Example CSV
                    </button>
                   </div>
                  {/* Optional Note */}
                  {/* <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong> Phone column is optional but recommended. 
                      Leave it empty if not available - LinkedIn data will be used when possible.
                    </p>
                  </div> */}
                </div>

              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#0b07f0] to-[#0b07f0] text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 hover:brightness-110 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Processing LinkedIn profiles...</span>
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
                                {result.data?.jobTitle && ` - ${result.data.jobTitle}`}
                                {result.data?.company && ` at ${result.data.company}`}
                                {result.data?.phone && ` | Phone: ${result.data.phone}`}
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;