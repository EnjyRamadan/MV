import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  User
} from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const { user, updatePoints } = useAuth();
  const { unlockContact } = useContacts();

  const handleUnlock = () => {
    if (user && user.points >= 20) {
      unlockContact(contact.id);
      updatePoints(user.points - 20);
    }
  };

  const canUnlock = user && user.points >= 20 && !contact.isUnlocked;

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
          <div className="space-y-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 text-green-700">
              <Unlock className="w-4 h-4" />
              <span className="text-sm font-medium">Contact Details Unlocked</span>
            </div>
            {contact.email && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{contact.phone}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">Contact details hidden</span>
            </div>
            <p className="text-xs text-gray-500">
              Unlock to view email and phone number
            </p>
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
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
              canUnlock
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Unlock (20 pts)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactCard;