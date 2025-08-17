import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Import your auth context
import { getDashboardForCurrentUser } from '../api/dashboardApi'; // Import your API function

// You can expand this with all fields your dashboard actually has
interface DashboardData {
  _id?: string;
  userId?: string;
  availablePoints: number;
  totalContacts?: number;
  unlockedProfiles?: number;
  myUploads?: number; // Changed to number for upload count
  uploadedProfileIds?: string[]; // Array of profile IDs
  unlockedContactIds?: string[]; // Array of unlocked contact IDs
  recentActivity?: string[];
  updatedAt?: Date;
  // add other dashboard-related fields if needed
}

interface DashboardContextType {
  dashboard: DashboardData | null;
  updatePoints: (pointsUpdater: number | ((prev: number) => number)) => void;
  setDashboard: React.Dispatch<React.SetStateAction<DashboardData | null>>;
  refreshDashboard: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user from auth context

  const updatePoints = (pointsUpdater: number | ((prev: number) => number)) => {
    setDashboard(prev => {
      if (!prev) {
        // If there's no dashboard yet, start from 0
        const initialPoints =
          typeof pointsUpdater === 'function' ? pointsUpdater(0) : pointsUpdater;
        return { 
          availablePoints: initialPoints,
          totalContacts: 0,
          unlockedProfiles: 0,
          myUploads: 0,
          uploadedProfileIds: [],
          unlockedContactIds: [],
          recentActivity: []
        };
      }
      return {
        ...prev,
        availablePoints:
          typeof pointsUpdater === 'function'
            ? pointsUpdater(prev.availablePoints)
            : pointsUpdater,
        updatedAt: new Date()
      };
    });
  };

  const refreshDashboard = async () => {
    if (!user) {
      setError('No user logged in');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedDashboard = await getDashboardForCurrentUser();
      
      // Ensure all required fields are present with defaults
      const normalizedDashboard: DashboardData = {
        ...updatedDashboard,
        availablePoints: updatedDashboard.availablePoints || 0,
        totalContacts: updatedDashboard.totalContacts || 0,
        unlockedProfiles: updatedDashboard.unlockedProfiles || 0,
        myUploads: updatedDashboard.myUploads || 0,
        uploadedProfileIds: updatedDashboard.uploadedProfileIds || [],
        unlockedContactIds: updatedDashboard.unlockedContactIds || [],
        recentActivity: Array.isArray(updatedDashboard.recentActivity) 
          ? updatedDashboard.recentActivity 
          : [],
        updatedAt: updatedDashboard.updatedAt || new Date()
      };
      
      setDashboard(normalizedDashboard);
      console.log('Dashboard refreshed successfully:', normalizedDashboard);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh dashboard';
      setError(errorMessage);
      
      // Set a minimal dashboard to prevent crashes
      setDashboard({
        availablePoints: 0,
        totalContacts: 0,
        unlockedProfiles: 0,
        myUploads: 0,
        uploadedProfileIds: [],
        unlockedContactIds: [],
        recentActivity: [],
        updatedAt: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard when user changes
  useEffect(() => {
    if (user) {
      refreshDashboard();
    } else {
      setDashboard(null);
      setError(null);
    }
  }, [user]);

  const value = {
    dashboard,
    updatePoints,
    setDashboard,
    refreshDashboard,
    loading,
    error
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};