import React, { useState } from 'react';
import { useContacts } from '../contexts/ContactContext';
import { 
  Users, 
  Download, 
  TrendingUp, 
  Award,
  Search,
  MoreVertical,
  Shield,
  Database
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const { contacts } = useContacts();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contacts'>('overview');

  // Mock user data for admin panel
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      points: 150,
      uploads: 12,
      unlocks: 8,
      joinedAt: new Date('2024-01-10'),
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      points: 89,
      uploads: 7,
      unlocks: 15,
      joinedAt: new Date('2024-01-15'),
      status: 'active'
    },
  ];

  const stats = [
    {
      name: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Contacts',
      value: contacts.length,
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Points Distributed',
      value: users.reduce((sum, user) => sum + user.points, 0),
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Active This Month',
      value: users.length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleExportData = () => {
    const csvContent = [
      'Name,Job Title,Company,Location,Industry,Experience,Skills,Email,Phone',
      ...contacts.map(contact => 
        `"${contact.name}","${contact.jobTitle}","${contact.company}","${contact.location}","${contact.industry}",${contact.experience},"${contact.skills.join('; ')}","${contact.email || ''}","${contact.phone || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contacts_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage users, contacts, and platform analytics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">Admin Access</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Contacts
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Platform Overview</h2>
                <button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export All Data</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New user registered</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Database className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">5 contacts uploaded</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
                  <div className="space-y-3">
                    {users.slice(0, 2).map((user, index) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-700">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.uploads} uploads</p>
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          {user.points} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Points</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Uploads</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Unlocks</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {user.points}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-900">{user.uploads}</td>
                        <td className="py-4 px-4 text-gray-900">{user.unlocks}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {user.joinedAt.toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Contact Database</h2>
                <button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Industry</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Uploaded</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {contact.avatar ? (
                              <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{contact.name}</p>
                              <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">{contact.company}</td>
                        <td className="py-4 px-4 text-gray-600">{contact.industry}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {contact.uploadedAt.toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            contact.isUnlocked
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {contact.isUnlocked ? 'Unlocked' : 'Locked'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;