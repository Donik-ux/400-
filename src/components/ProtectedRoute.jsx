import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export const ProtectedRoute = ({ children }) => {
  const user     = useAuthStore(s => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const user     = useAuthStore(s => s.user);
  const location = useLocation();
  if (!user)                  return <Navigate to="/login"  state={{ from: location }} replace />;
  if (user.role !== 'admin')  return <Navigate to="/"       replace />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const user = useAuthStore(s => s.user);
  if (user) return <Navigate to="/" replace />;
  return children;
};
