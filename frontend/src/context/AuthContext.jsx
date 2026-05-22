import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("voicecast_user");
      if (stored && stored !== "undefined" && stored !== "null") {
        return JSON.parse(stored);
      }
      return null;
    } catch (err) {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/api/auth/profile');
        setUser(data);
        localStorage.setItem('voicecast_user', JSON.stringify(data));
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (email, password, role) => {
    try {
      setLoading(true);
      // Map 'listener' to 'user' for the URL if needed, but the backend handles it too
      const urlRole = role === 'listener' ? 'user' : role;
      const { data } = await api.post(`/api/auth/login/${urlRole}`, { email, password, role });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('voicecast_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.unverified) {
        throw { unverified: true, email };
      }
      throw errorData?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      const { data } = await api.post('/api/auth/register', { name, email, password, role });
      return data; // Will be { success: true, message: 'OTP sent successfully' }
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('voicecast_user');
    sessionStorage.clear();
    // Use navigate if possible, but window.location is safer for global state
    if (!window.location.pathname.includes('/login')) {
       window.location.href = '/login/user';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
