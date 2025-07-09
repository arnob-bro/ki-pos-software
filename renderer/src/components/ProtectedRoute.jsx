import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermissionByCode } from '../utils/permissions';

/**
 * ProtectedRoute component that checks user permissions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.requiredPermission - Required permission code
 * @param {string} props.fallbackPath - Path to redirect if permission denied
 * @param {React.ReactNode} props.fallbackComponent - Component to render if permission denied
 * @returns {React.ReactNode} Protected component or fallback
 */
const ProtectedRoute = ({ 
  children, 
  requiredPermission, 
  fallbackPath = '/sales-interface',
  fallbackComponent = null 
}) => {
  // Check if user is authenticated
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    return <Navigate to="/" replace />;
  }

  // If no permission required, render children
  if (!requiredPermission) {
    return children;
  }

  // Check if user has the required permission
  const hasPermission = hasPermissionByCode(requiredPermission);
  
  if (!hasPermission) {
    // If fallback component is provided, render it
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    // Otherwise redirect to fallback path
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute; 