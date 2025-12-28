import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MaintenanceOverlay from '../MaintenanceOverlay';

// User emails that should see maintenance screen
const MAINTENANCE_USER_EMAILS = [
  'nagashreenagashreecm502@gmail.com',
  'chandrashekhargawda2000@gmail.com'
];

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Shows maintenance overlay for specific user
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // MAINTENANCE MODE: Show overlay for specific users
  if (user?.email && MAINTENANCE_USER_EMAILS.includes(user.email)) {
    return <MaintenanceOverlay />;
  }

  return children;
};

export default ProtectedRoute;
