// Role Management Utilities
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Normalize role to lowercase for comparison
const normalizeRole = (role) => (role || '').toLowerCase().trim();

export const checkRole = (userRoles, requiredRole) => {
  if (!userRoles) return false;
  
  // Handle both array and string formats
  const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
  
  // Normalize all roles to lowercase
  const normalizedRoles = roles.map(normalizeRole);
  const normalizedRequired = normalizeRole(requiredRole);
  
  // Role hierarchy: super_admin > admin > user
  const roleHierarchy = {
    [ROLES.USER]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.SUPER_ADMIN]: 3
  };
  
  // Check if user has the required role or higher
  const userHighestRole = Math.max(...normalizedRoles.map(role => roleHierarchy[role] || 0));
  return userHighestRole >= roleHierarchy[normalizedRequired];
};

export const hasAdminAccess = (user) => {
  if (!user) return false;
  
  // Handle both roles array and role string
  const roles = user.roles || user.role;
  if (!roles) return false;
  
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const normalizedRoles = roleArray.map(normalizeRole);
  return normalizedRoles.includes(ROLES.ADMIN) || normalizedRoles.includes(ROLES.SUPER_ADMIN);
};