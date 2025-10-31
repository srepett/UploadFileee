
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { AuthContextType, User } from '../types';
import * as api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = useCallback(async () => {
    setLoading(true);
    try {
      const sessionUser = await api.getCurrentUser();
      setUser(sessionUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const loggedInUser = await api.login(email, pass);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error(error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const newUser = await api.register(email, pass);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error(error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
