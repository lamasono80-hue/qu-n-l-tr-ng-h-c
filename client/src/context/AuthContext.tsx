import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { profileService } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('uniconnect_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('uniconnect_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('uniconnect_token', newToken);
    localStorage.setItem('uniconnect_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('uniconnect_token');
    localStorage.removeItem('uniconnect_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updatedFields };
      setUser(merged);
      localStorage.setItem('uniconnect_user', JSON.stringify(merged));
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await profileService.getMyProfile();
      if (res.data) {
        const u: User = {
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
          status: res.data.status,
          full_name: res.data.full_name,
          avatar_url: res.data.avatar_url,
          campus: res.data.campus,
          major: res.data.major,
          year_of_study: res.data.year_of_study,
          bio: res.data.bio,
          is_profile_complete: res.data.is_profile_complete,
        };
        setUser(u);
        localStorage.setItem('uniconnect_user', JSON.stringify(u));
      }
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await refreshProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token, refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
