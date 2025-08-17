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

const API_BASE_URL = 'https://contactpro-backend.vercel.app';

export const getDashboardForCurrentUser = async (): Promise<DashboardData> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Now we can directly get dashboard data with authentication
    // The server gets userId from the JWT token, no need to call /auth/me first
    const dashboardResponse = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (dashboardResponse.status === 401) {
      // Token expired or invalid - clear and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    if (!dashboardResponse.ok) {
      const errorData = await dashboardResponse.text();
      throw new Error(`Failed to fetch dashboard data: ${errorData}`);
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

export const updateDashboard = async (updateData: Partial<DashboardData>): Promise<DashboardData> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // No need to pass userId - server gets it from token
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to update dashboard: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
};

// Get user's unlocked contacts
export const getUserUnlockedContacts = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/dashboard/unlocked`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch unlocked contacts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching unlocked contacts:', error);
    throw error;
  }
};

// Get user's activity
export const getUserActivity = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/dashboard/activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch user activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

// Add activity
export const addUserActivity = async (activity: string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/dashboard/activity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ activity })
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error('Failed to add activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};