import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Strict role-based protection
  const isAdmin = user?.role === "admin";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.warn("Unauthorized access attempt to admin route by:", user.email);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
