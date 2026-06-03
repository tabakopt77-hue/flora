
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: string, customUser?: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth on mount
    const initAuth = () => {
      if (authService.isAuthenticated()) {
        const storedUser = authService.getCurrentUser();
        setUser(storedUser);
      } else {
        // If token invalid/expired, clear garbage
        authService.logout();
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (provider: string, customUser?: User) => {
    setIsLoading(true);
    try {
      if (customUser) {
        localStorage.setItem('bloom_jwt_token', 'mock-jwt-token-' + crypto.randomUUID());
        localStorage.setItem('bloom_user_data', JSON.stringify(customUser));
        setUser(customUser);
      } else {
        const response = await authService.login(provider);
        setUser(response.user);
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
