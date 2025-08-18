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
          hasContactInfo: !!(data.email || data.phone)
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
          {/* Work Experience */}
          {contact.workExperience && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{contact.workExperience}</p>
              </div>
            </div>
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