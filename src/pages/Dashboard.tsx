import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useContacts } from '../contexts/ContactContext';
import { 
  TrendingUp, 
  Users, 
  Upload, 
  Unlock,
  Search,
  ArrowRight,
  Calendar,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { contacts } = useContacts();

  const unlockedContacts = contacts.filter(c => c.isUnlocked);
  const myUploads = contacts.filter(c => c.uploadedBy === user?.id);

  const stats = [
    {
      name: 'Available Points',
      value: user?.points || 0,
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Contacts',
      value: contacts.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Unlocked Profiles',
      value: unlockedContacts.length,
      icon: Unlock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'My Uploads',
      value: myUploads.length,
      icon: Upload,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      name: 'Search Contacts',
      description: 'Find professionals with advanced filters',
      href: '/search',
      icon: Search,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Upload Contacts',
      description: 'Add new contacts and earn points',
      href: '/upload',
      icon: Upload,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your contact network today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              to={action.href}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-gray-600">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Last 7 days</span>
          </div>
        </div>

        <div className="space-y-4">
          {myUploads.slice(0, 5).map((contact) => (
            <div key={contact.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Uploaded {contact.name}
                </p>
                <p className="text-xs text-gray-500">
                  {contact.jobTitle} at {contact.company} • +10 points
                </p>
              </div>
              <div className="text-xs text-gray-400">
                {contact.uploadedAt.toLocaleDateString()}
              </div>
            </div>
          ))}

          {myUploads.length === 0 && (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No uploads yet</p>
              <Link
                to="/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Upload Your First Contact
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;