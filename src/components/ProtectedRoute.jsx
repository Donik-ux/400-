import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export const ProtectedRoute = ({ children }) => {
  const user     = useAuthStore(s => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// Re-verifies the admin session's signed token against the server
// (api/adminAuth.js) on every mount. `user.role === 'admin'` alone is NOT
// trusted — that field lives in localStorage, and anyone can set it from
// devtools. Only a token whose signature checks out (server-only secret)
// grants access.
export const AdminRoute = ({ children }) => {
  const user         = useAuthStore(s => s.user);
  const verifyAdmin  = useAuthStore(s => s.verifyAdmin);
  const location     = useLocation();
  const isAdminClaim = !!user && user.role === 'admin';
  const [valid, setValid] = useState(null); // null = still checking

  useEffect(() => {
    if (!isAdminClaim) return;
    let cancelled = false;
    verifyAdmin().then((ok) => { if (!cancelled) setValid(ok); });
    return () => { cancelled = true; };
  }, [isAdminClaim, verifyAdmin]);

  if (!user)          return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdminClaim)  return <Navigate to="/"      replace />;
  if (valid === null) return null; // brief verification flash, not worth a spinner
  if (!valid)         return <Navigate to="/"      replace />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const user = useAuthStore(s => s.user);
  if (user) return <Navigate to="/" replace />;
  return children;
};
