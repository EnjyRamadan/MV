import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContacts } from '../contexts/ContactContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft,
  MapPin,
  Building,
  Calendar,
  Award,
  Mail,
  Phone,
  Unlock,
  User,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { contacts, unlockContact } = useContacts();
  const { user, updatePoints } = useAuth();

  const contact = contacts.find(c => c.id === id);

  if (!contact) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Not Found</h1>
          <Link
            to="/search"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const handleUnlock = () => {
    if (user && user.points >= 20) {
      unlockContact(contact.id);
      updatePoints(user.points - 20);
    }
  };

  const canUnlock = user && user.points >= 20 && !contact.isUnlocked;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/search"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Search</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8">
          <div className="flex items-start space-x-6">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {contact.name}
              </h1>
              <p className="text-xl text-blue-600 font-semibold mb-4">
                {contact.jobTitle}
              </p>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>{contact.company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{contact.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{contact.experience} years experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Professional Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Industry</p>
                    <p className="font-medium text-gray-900">{contact.industry}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Seniority Level</p>
                    <p className="font-medium text-gray-900">{contact.seniorityLevel}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Experience</p>
                    <p className="font-medium text-gray-900">{contact.experience} years</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {contact.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              {contact.education && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>Education</span>
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{contact.education}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Details Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                
                {contact.isUnlocked ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-green-700 mb-4">
                      <Unlock className="w-5 h-5" />
                      <span className="font-medium">Contact Details Unlocked</span>
                    </div>
                    
                    {contact.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{contact.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{contact.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">
                        Contact details are locked. Unlock to view email and phone number.
                      </p>
                      
                      {canUnlock ? (
                        <button
                          onClick={handleUnlock}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                        >
                          <Award className="w-5 h-5" />
                          <span>Unlock for 20 Points</span>
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-500 text-sm mb-2">
                            {user && user.points < 20 ? 'Insufficient points' : 'Already unlocked'}
                          </p>
                          <div className="bg-gray-200 text-gray-500 py-3 px-4 rounded-lg font-medium">
                            Need 20 Points to Unlock
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;