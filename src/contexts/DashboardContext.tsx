// contexts/DashboardContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// You can expand this with all fields your dashboard actually has
interface DashboardData {
  _id?: string;
  userId?: string;
  availablePoints: number;
  totalContacts?: number;
  unlockedProfiles?: number;
  // add other dashboard-related fields if needed
}

interface DashboardContextType {
  dashboard: DashboardData | null;
  updatePoints: (pointsUpdater: number | ((prev: number) => number)) => void;
  setDashboard: React.Dispatch<React.SetStateAction<DashboardData | null>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

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

  return (
    <DashboardContext.Provider value={{ dashboard, updatePoints, setDashboard }}>
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
