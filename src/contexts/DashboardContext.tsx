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
  myUploads?: string[];
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
        return { availablePoints: initialPoints };
      }
      return {
        ...prev,
        availablePoints:
          typeof pointsUpdater === 'function'
            ? pointsUpdater(prev.availablePoints)
            : pointsUpdater
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
      setDashboard(updatedDashboard);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setError('Failed to refresh dashboard');
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