import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      // 1. ONE-TIME CLEANUP MIGRATION
      const migrationKey = "auth_cleanup_v2";
      if (!localStorage.getItem(migrationKey)) {
        console.log("🧹 [AUTH] Running one-time storage cleanup...");
        const keysToRemove = [
          "amit", "Guest User", "default admin", "mockUser", 
          "fallbackUser", "local_user", "temp_user", "guest_user"
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Clear any potentially corrupt session data
        const oldUser = localStorage.getItem("voicecast_user");
        if (oldUser && (oldUser.includes("amit") || oldUser.includes("Guest User"))) {
          console.log("🗑️ [AUTH] Removing stale fallback user data");
          localStorage.removeItem("voicecast_user");
          localStorage.removeItem("token");
        }
        
        localStorage.setItem(migrationKey, "true");
      }

      const stored = localStorage.getItem("voicecast_user");
      if (stored && stored !== "undefined" && stored !== "null") {
        const parsed = JSON.parse(stored);
        console.log("👤 [AUTH] Restoring user from storage:", parsed.email);
        return parsed;
      }
      return null;
    } catch (err) {
      console.error("❌ [AUTH] Failed to parse stored user:", err);
      localStorage.removeItem("voicecast_user");
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("🔒 [AUTH] No token found, session idle");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 [AUTH] Validating session token...");
        const { data } = await api.get('/api/auth/profile');
        console.log("✅ [AUTH] Session valid:", data.email, "| Role:", data.role);
        setUser(data);
        localStorage.setItem('voicecast_user', JSON.stringify(data));
      } catch (err) {
        console.error("❌ [AUTH] Session validation failed, clearing state:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log("🚀 [AUTH] Attempting login for:", email);
      const { data } = await api.post('/api/auth/login', { email, password });
      
      console.log("📦 [AUTH] Login Response User:", data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('voicecast_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("⚠️ [AUTH] Login Failed:", err.response?.data?.message || err.message);
      throw err.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      console.log("🚀 [AUTH] Registering new node:", email);
      const { data } = await api.post('/api/auth/register', { name, email, password, role });
      
      console.log("📦 [AUTH] Register Response User:", data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('voicecast_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("⚠️ [AUTH] Registration Failed:", err.response?.data?.message || err.message);
      throw err.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      console.log("🚪 [AUTH] Purging session and redirecting...");
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
