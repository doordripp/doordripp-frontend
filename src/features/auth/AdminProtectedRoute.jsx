// src/features/auth/AdminProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/roleUtils";

export default function AdminProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin(auth.user)) return <Navigate to="/" replace />;
  return children;
}