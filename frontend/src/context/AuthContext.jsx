import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("voicecast_user");
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('voicecast_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      const { data } = await api.post('/api/auth/register', { name, email, password, role });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('voicecast_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('voicecast_user');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
