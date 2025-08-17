import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  isAdmin: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // ✅ added
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updatePoints: (points: number) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('https://contactpro-backend.vercel.app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      points: 0,
      isAdmin: false,
      avatar: '',
    };

    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', data.token);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch('https://contactpro-backend.vercel.app/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      points: 0,
      isAdmin: false,
      avatar: '',
    };

    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', data.token);
  };

  const loginWithGoogle = async () => {
    window.location.href = "https://contactpro-backend.vercel.app/auth/google";
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updatePoints = (points: number) => {
    if (user) {
      const updatedUser = { ...user, points };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    setUser, // ✅ added here
    login,
    loginWithGoogle,
    register,
    logout,
    updatePoints,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
