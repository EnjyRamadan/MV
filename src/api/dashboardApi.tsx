// src/api/dashboardApi.ts
interface DashboardData {
  _id?: string;
  userId?: string;
  availablePoints: number;
  totalContacts?: number;
  unlockedProfiles?: number;
  myUploads?: number;
  uploadedProfileIds?: string[];
  unlockedContactIds?: string[];
  recentActivity?: string[];
  updatedAt?: Date;
}

export const getDashboardForCurrentUser = async (): Promise<DashboardData> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // First, get the current user to get their ID
    const userResponse = await fetch('http://localhost:5000/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user information');
    }

    const user = await userResponse.json();
    
    // Then get the dashboard data
    const dashboardResponse = await fetch(`http://localhost:5000/dashboard/${user._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!dashboardResponse.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const dashboardData = await dashboardResponse.json();
    
    // Transform the data to ensure proper types
    return {
      ...dashboardData,
      availablePoints: dashboardData.availablePoints || 0,
      totalContacts: dashboardData.totalContacts || 0,
      unlockedProfiles: dashboardData.unlockedProfiles || 0,
      myUploads: dashboardData.myUploads || 0,
      uploadedProfileIds: dashboardData.uploadedProfileIds || [],
      unlockedContactIds: dashboardData.unlockedContactIds || [],
      recentActivity: Array.isArray(dashboardData.recentActivity) ? dashboardData.recentActivity : [],
      updatedAt: dashboardData.updatedAt ? new Date(dashboardData.updatedAt) : new Date()
    };
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

export const updateDashboard = async (userId: string, updateData: Partial<DashboardData>): Promise<DashboardData> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:5000/dashboard/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error('Failed to update dashboard');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
};