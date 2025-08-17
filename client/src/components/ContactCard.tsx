import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { useContacts, Contact } from '../contexts/ContactContext';
import { 
  MapPin, 
  Building, 
  Calendar, 
  Unlock, 
  Eye, 
  Award,
  Mail,
  Phone,
  User,
  Lock,
  AlertCircle
} from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const { user } = useAuth();
  const { dashboard, updatePoints } = useDashboard();
  const { unlockContact } = useContacts();

  // Get points from dashboard context instead of user
  const availablePoints = dashboard?.availablePoints || 0;
  const canUnlock = availablePoints >= 20 && !contact.isUnlocked;
  const hasInsufficientPoints = availablePoints < 20 && !contact.isUnlocked;

  const handleUnlock = async () => {
    if (!canUnlock) return;
    
    try {
      // Call backend API to unlock profile and deduct points
      const response = await fetch(`http://localhost:5000/profiles/${contact.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || dashboard?.userId, // Send user ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlock contact');
      }

      const result = await response.json();
      
      // Update local state with the response
      updatePoints(result.remainingPoints);
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
}

  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
      {/* Profile Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {contact.name}
            </h3>
            <p className="text-blue-600 font-medium mb-2">
              {contact.jobTitle}
            </p>
            <div className="flex items-center space-x-1 text-gray-600 mb-1">
              <Building className="w-4 h-4" />
              <span className="text-sm">{contact.company}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{contact.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="px-6 pb-4">
        <div className="flex items-center space-x-1 text-gray-600 mb-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{contact.experience} years experience</span>
        </div>
        
        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {contact.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {contact.skills.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                +{contact.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Contact Info - Locked/Unlocked */}
        {contact.isUnlocked ? (
          <div className="space-y-2 mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 text-green-700 mb-3">
              <Unlock className="w-5 h-5" />
              <span className="text-sm font-semibold">Contact Details Unlocked</span>
            </div>
            {contact.email && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{contact.phone}</span>
              </div>
            )}
            {!contact.email && !contact.phone && (
              <div className="text-sm text-gray-500 italic">
                No contact information available
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center justify-center space-x-2 text-gray-500 mb-3">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Contact Information Locked</span>
            </div>
            
            {/* Points Status */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">
                  Your Points: <span className="font-semibold text-purple-600">{availablePoints}</span>
                </span>
              </div>
              
              {hasInsufficientPoints && (
                <div className="flex items-center justify-center space-x-1 text-red-500 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Insufficient points to unlock</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 text-center mb-4">
              Unlock to view email and phone number
            </p>

            <button
              onClick={handleUnlock}
              disabled={!canUnlock}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                canUnlock
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {hasInsufficientPoints 
                  ? `Need ${20 - availablePoints} more points`
                  : 'Unlock for 20 Points'
                }
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex space-x-3">
        <Link
          to={`/profile/${contact.id}`}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Profile</span>
        </Link>
        
        {!contact.isUnlocked && (
          <button
            onClick={handleUnlock}
            disabled={!canUnlock}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
              canUnlock
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>
              {hasInsufficientPoints 
                ? 'Insufficient Points'
                : 'Unlock (20 pts)'
              }
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactCard;