import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../contexts/DashboardContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Upload, 
  Unlock,
  Search,
  ArrowRight,
  Calendar,
  Award
} from 'lucide-react';

interface RecentActivityItem {
  action: string;
  timestamp: string;
  points?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dashboard, loading, error, refreshDashboard } = useDashboard();
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);

  useEffect(() => {
    // Process recent activity from dashboard
    if (dashboard?.recentActivity && Array.isArray(dashboard.recentActivity)) {
      const processedActivities: RecentActivityItem[] = dashboard.recentActivity.map((activity, index) => {
        // Determine if it's an upload or unlock action
        const isUpload = activity.toLowerCase().includes('uploaded');
        const isUnlock = activity.toLowerCase().includes('unlocked');
        
        return {
          action: activity,
          timestamp: dashboard.updatedAt ? new Date(dashboard.updatedAt).toLocaleDateString() : 'Recent',
          points: isUpload ? 10 : isUnlock ? -20 : 0
        };
      }).reverse(); // Show most recent first

      setRecentActivities(processedActivities);
    }
  }, [dashboard]);

  const stats = [
    {
      name: 'Available Points',
      value: dashboard?.availablePoints ?? 0,
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'My Uploads',
      value: dashboard?.myUploads ?? 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Unlocked Profiles',
      value: dashboard?.unlockedProfiles ?? 0,
      icon: Unlock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Total Contacts',
      value: dashboard?.totalContacts ?? 0,
      icon: Search,
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

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading dashboard: {error}</p>
          <button 
            onClick={refreshDashboard}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'User'}!
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
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
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
            <span>Last updated: {dashboard?.updatedAt ? new Date(dashboard.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 5).map((activity, index) => {
              const isUpload = activity.action.toLowerCase().includes('uploaded');
              const isUnlock = activity.action.toLowerCase().includes('unlocked');
              
              return (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isUpload ? 'bg-green-100' : isUnlock ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {isUpload ? (
                      <Upload className="w-5 h-5 text-green-600" />
                    ) : isUnlock ? (
                      <Unlock className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Award className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.points !== undefined && activity.points !== 0 && (
                        <span className={`font-medium ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.points > 0 ? '+' : ''}{activity.points} points
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.timestamp}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No recent activity</p>
              <p className="text-sm text-gray-400 mb-4">Start by uploading contacts or unlocking profiles to see your activity here.</p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Upload Contacts
                </Link>
                <Link
                  to="/search"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Browse Contacts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Show More Activity Link */}
        {recentActivities.length > 5 && (
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View All Activity ({recentActivities.length} total)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;