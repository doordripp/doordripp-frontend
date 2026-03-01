// Role Based Route Component
import { useAuth } from '../../context/AuthContext';
import { checkRole } from '../../utils/roleUtils';
import { Navigate } from 'react-router-dom';

export default function RoleBasedRoute({ children, requiredRole }) {
  const { user, initializing } = useAuth();
  
  // Show loading while checking authentication
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role (supports array or single role)
  const userRoles = user.roles || user.role;
  const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  const hasAccess = rolesArray.some(role => checkRole(userRoles, role));
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}