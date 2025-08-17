import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContacts } from '../contexts/ContactContext';
import { useDashboard } from '../contexts/DashboardContext';
import { Upload, FileText, Plus, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getDashboardForCurrentUser } from '../api/dashboardApi';

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const { addContact } = useContacts();
  const { dashboard, refreshDashboard } = useDashboard();

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

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
    email: '',
    phone: '',
    avatar: '',
  });

  const [csvData, setCsvData] = useState('');

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
      // Upload contact - this now also updates dashboard points on backend
      const res = await fetch('https://contactpro-backend.vercel.app/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });

      if (!res.ok) throw new Error('Failed to save contact');
      const savedContact = await res.json();

      // Update local contact state and refresh dashboard
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
        email: '',
        phone: '',
        avatar: '',
      });
    } catch (error) {
      console.error('Error uploading contact:', error);
      toast.error('Failed to upload contact');
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      const contacts = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const contact: any = { uploadedBy: user.id };

        headers.forEach((header, index) => {
          contact[header] = values[index] || '';
        });

        if (contact.skills) {
          contact.skills = contact.skills
            .split(';')
            .map((s: string) => s.trim())
            .filter((s: string) => s);
        }

        if (!contact.avatar) {
          contact.avatar =
            'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
        }

        contact.experience = Number(contact.experience) || 0;
        return contact;
      });

      // Use the bulk upload endpoint
      const res = await fetch('https://contactpro-backend.vercel.app/profiles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profiles: contacts,
          uploadedBy: user.id
        })
      });

      if (!res.ok) throw new Error('Failed to bulk upload contacts');
      const result = await res.json();

      // Refresh dashboard to get updated points
      await refreshDashboard();

      const numContacts = result.count;
      toast.success(`${numContacts} contacts uploaded successfully! +${numContacts * 10} points`);
      setCsvData('');
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to upload contacts in bulk');
    }
  };

  const csvTemplate = `name,jobTitle,company,location,industry,experience,seniorityLevel,skills,education,email,phone
John Doe,Software Engineer,Tech Corp,San Francisco CA,Technology,5,Senior,React;Node.js;TypeScript,BS Computer Science,john@example.com,555-0123`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Contacts</h1>
        <p className="text-gray-600">
          Add new contacts to earn points and help grow the community database
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
            <span>Single Upload</span>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'bulk'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Bulk Upload</span>
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Upload Contact (+10 points)</span>
            </button>
          </form>
        )}

        {activeTab === 'bulk' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Format Instructions</h3>
              <p className="text-gray-600 mb-4">
                Upload multiple contacts using CSV format. Use semicolons (;) to separate multiple skills.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Template:</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">{csvTemplate}</pre>
              </div>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CSV Data</label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your CSV data here..."
                />
              </div>

              <button
                type="submit"
                disabled={!csvData.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                <span>Upload CSV (+10 points per contact)</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;