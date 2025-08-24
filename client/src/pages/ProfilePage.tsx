import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { useContacts, Contact } from '../contexts/ContactContext';
import {
  ArrowLeft,
  MapPin,
  Building,
  Calendar,
  GraduationCap,
  Award,
  Mail,
  Phone,
  User,
  Lock,
  Unlock,
  AlertCircle,
  Loader,
  Briefcase
} from 'lucide-react';

// Work Experience Parser and Display Component
// Work Experience Parser and Display Component
const WorkExperienceSection = ({ workExperience }: { workExperience: string }) => {
  // Function to parse work experience string into structured data
  const parseWorkExperience = (workExpString: string) => {
    if (!workExpString) return [];
    
    const entries = workExpString.split('---').map(entry => entry.trim());
    
    return entries.map((entry, index) => {
      // Match pattern: Title at Company (date - date) - Location
      // Also try to extract description if it's on separate lines
      const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
      const mainLine = lines[0] || entry;
      const description = lines.slice(1).join('\n').trim();
      
      const match = mainLine.match(/^(.+?)\s+at\s+(.+?)\s+\((.+?)\)(?:\s+-\s+(.+?))?$/);
      
      if (match) {
        const [, title, company, dateRange, location] = match;
        const [startDate, endDate] = dateRange.split(' - ').map(d => d.trim());
        
        return {
          id: index,
          title: title.trim(),
          company: company.trim(),
          startDate: startDate,
          endDate: endDate || 'Present',
          location: location?.trim() || '',
          description: description || '',
          current: endDate?.toLowerCase().includes('present') || !endDate
        };
      }
      
      // Fallback parsing for different formats
      const parts = mainLine.split(' at ');
      if (parts.length >= 2) {
        return {
          id: index,
          title: parts[0].trim(),
          company: parts.slice(1).join(' at ').trim(),
          startDate: '',
          endDate: '',
          location: '',
          description: description || '',
          current: false
        };
      }
      
      return {
        id: index,
        title: entry,
        company: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        current: false
      };
    });
  };

  const workHistory = parseWorkExperience(workExperience);

  if (workHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Briefcase className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
      </div>
      
      <div className="space-y-6">
        {workHistory.map((job, index) => (
          <div key={job.id} className="relative">
            {/* Timeline connector */}
            {index < workHistory.length - 1 && (
              <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200"></div>
            )}
            
            <div className="flex items-start space-x-4">
              {/* Timeline dot */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                job.current 
                  ? 'bg-green-100 border-2 border-green-500' 
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  job.current ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              
              {/* Job details */}
              <div className="flex-1 min-w-0">
                {/* Job Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {job.title}
                </h3>
                
                {/* Company Name - Bold and Prominent */}
                {job.company && (
                  <div className="mb-3">
                    <span className="text-lg font-bold text-blue-700">
                      {job.company}
                    </span>
                  </div>
                )}
                
                {/* Metadata Section */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  {(job.startDate || job.endDate) && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {job.startDate && job.endDate 
                          ? `${job.startDate} - ${job.endDate}`
                          : job.startDate || job.endDate
                        }
                      </span>
                    </div>
                  )}
                  
                  {job.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  
                  {job.current && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Current Role
                    </span>
                  )}
                </div>
                
                {/* Description Section - Separate from metadata */}
                {job.description && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {job.description}
                    </div>
                  </div>
                )}
                
                {/* Divider between jobs */}
                {index < workHistory.length - 1 && (
                  <hr className="mt-6 border-gray-200" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Raw data fallback (optional - remove if not needed) */}
      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
          View raw data
        </summary>
        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs whitespace-pre-wrap text-gray-600">
          {workExperience}
        </pre>
      </details>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dashboard, updatePoints } = useDashboard();
  const { unlockContact } = useContacts();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get points from dashboard context
  const availablePoints = dashboard?.availablePoints || 0;
  const canUnlock = availablePoints >= 20 && contact && !contact.isUnlocked;
  const hasInsufficientPoints = availablePoints < 20 && contact && !contact.isUnlocked;

  // Fetch contact data
  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const url = user?.id 
          ? `https://contactpro-backend.vercel.app/profiles/${id}?userId=${user.id}`
          : `https://contactpro-backend.vercel.app/profiles/${id}`;
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Contact not found');
        }
        
        const data = await response.json();
        
        const transformedContact: Contact = {
          id: data.id || data._id,
          name: data.name || '',
          jobTitle: data.jobTitle || '',
          company: data.company || '',
          location: data.location || '',
          industry: data.industry || '',
          experience: data.experience || 0,
          seniorityLevel: data.seniorityLevel || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          education: data.education || '',
          workExperience: data.workExperience || '', // Include work experience
          email: data.email,
          phone: data.phone,
          avatar: data.avatar || '',
          isUnlocked: data.isUnlocked || false,
          uploadedBy: data.uploadedBy || '',
          uploadedAt: data.uploadedAt ? new Date(data.uploadedAt) : new Date(),
          hasContactInfo: !!(data.email || data.phone),
          extraLinks: Array.isArray(data.extraLinks) ? data.extraLinks : []
        };
        
        setContact(transformedContact);
      } catch (err) {
        console.error('Error fetching contact:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contact');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id, user?.id]);

  const handleUnlock = async () => {
    if (!canUnlock || !user?.id || !contact) return;
    
    try {
      setUnlocking(true);
      
      // Call backend API to unlock profile and deduct points
      const response = await fetch(`https://contactpro-backend.vercel.app/profiles/${contact.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlock contact');
      }

      const result = await response.json();
      
      // Update dashboard points with exact value from backend
      updatePoints(result.remainingPoints);
      
      // Update contact unlock status locally
      setContact(prev => prev ? { ...prev, isUnlocked: true } : null);
      unlockContact(contact.id);
      
      console.log('Contact unlocked successfully:', result);
      
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error unlocking contact:', error);
        alert(`Failed to unlock contact: ${error.message}`);
      } else {
        console.error('Unknown error unlocking contact:', error);
        alert('Failed to unlock contact: Unknown error');
      }
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading contact...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Contact</h3>
          <p className="text-red-600">{error || 'Contact not found'}</p>
          <button 
            onClick={() => navigate('/search')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/search')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Search</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex items-start space-x-6">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {contact.name}
              </h1>
              <p className="text-xl text-blue-600 font-medium mb-4">
                {contact.jobTitle}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building className="w-5 h-5" />
                  <span>{contact.company}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{contact.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{contact.experience} years experience</span>
                </div>
                {contact.education && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <GraduationCap className="w-5 h-5" />
                    <span>{contact.education}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Skills, Work Experience & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Work Experience - Enhanced Version */}
          {contact.workExperience && (
            <WorkExperienceSection workExperience={contact.workExperience} />
          )}

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {contact.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Industry:</span>
                <p className="text-gray-900">{contact.industry}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Seniority Level:</span>
                <p className="text-gray-900">{contact.seniorityLevel}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Experience:</span>
                <p className="text-gray-900">{contact.experience} years</p>
              </div>
              {contact.education && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Education:</span>
                  <p className="text-gray-900">{contact.education}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Extra Links */}
          {contact.extraLinks && contact.extraLinks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Links</h2>
              <div className="space-y-3">
                {contact.extraLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <span className="text-blue-600 hover:text-blue-800 break-all">{link}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Contact Information */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            {contact.isUnlocked ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-green-700 mb-4 p-3 bg-green-50 rounded-lg">
                  <Unlock className="w-5 h-5" />
                  <span className="font-semibold">Contact Details Unlocked</span>
                </div>
                
                {contact.email && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{contact.email}</p>
                    </div>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{contact.phone}</p>
                    </div>
                  </div>
                )}
                
                {!contact.email && !contact.phone && (
                  <p className="text-gray-500 italic text-center py-4">
                    No contact information available
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                
                <p className="text-gray-600 mb-4">
                  Contact details are locked. Unlock to view email and phone number.
                </p>
                
                {/* Points Status */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      Your Points: <span className="font-semibold text-purple-600">{availablePoints}</span>
                    </span>
                  </div>
                  
                  {hasInsufficientPoints && (
                    <div className="flex items-center justify-center space-x-1 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Insufficient points</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUnlock}
                  disabled={!canUnlock || unlocking}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                    canUnlock && !unlocking
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {unlocking ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>
                        {hasInsufficientPoints 
                          ? `Need ${20 - availablePoints} More Points`
                          : 'Need 20 Points to Unlock'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Additional Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Uploaded:</span>
                <span className="font-medium">{contact.uploadedAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skills Count:</span>
                <span className="font-medium">{contact.skills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has Contact Info:</span>
                <span className="font-medium">{contact.hasContactInfo ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has Work Experience:</span>
                <span className="font-medium">{contact.workExperience ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;