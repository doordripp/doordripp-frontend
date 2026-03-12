// Role Management Utilities
export const ROLES = {
  USER: 'user',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  DELIVERY_PARTNER: 'delivery_partner',
  SUPER_ADMIN: 'super_admin'
};

// Normalize role to lowercase for comparison
const normalizeRole = (role) => (role || '').toLowerCase().trim();
export const getEffectiveRoles = (roles = []) => {
  const roleArray = Array.isArray(roles) ? roles : [roles]
  return Array.from(new Set([ROLES.CUSTOMER, ...roleArray.map(normalizeRole).filter(Boolean)]))
}

export const checkRole = (userRoles, requiredRole) => {
  if (!userRoles) return false;
  if (!requiredRole) return false;
  
  // Handle both array and string formats
  const roles = getEffectiveRoles(userRoles);
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Normalize all roles to lowercase
  const normalizedRoles = roles.map(normalizeRole);
  const normalizedRequiredRoles = requiredRoles.map(normalizeRole);

  // Direct exact-role check (supports array input)
  if (normalizedRequiredRoles.some(role => normalizedRoles.includes(role))) {
    return true;
  }
  
  // Role hierarchy: super_admin > admin > user
  const roleHierarchy = {
    [ROLES.USER]: 1,
    [ROLES.CUSTOMER]: 1,
    [ROLES.MANAGER]: 2,
    [ROLES.DELIVERY_PARTNER]: 2,
    [ROLES.ADMIN]: 2,
    [ROLES.SUPER_ADMIN]: 3
  };
  
  // Fallback hierarchy check for single required role
  if (normalizedRequiredRoles.length !== 1) {
    return false;
  }

  const normalizedRequired = normalizedRequiredRoles[0];
  const userHighestRole = Math.max(...normalizedRoles.map(role => roleHierarchy[role] || 0));
  return userHighestRole >= roleHierarchy[normalizedRequired];
};

export const hasAdminAccess = (user) => {
  if (!user) return false;
  
  // Handle both roles array and role string
  const roles = user.roles || user.role;
  if (!roles) return false;
  
  const normalizedRoles = getEffectiveRoles(roles);
  return normalizedRoles.includes(ROLES.ADMIN) || normalizedRoles.includes(ROLES.SUPER_ADMIN);
};

export const hasDeliveryPartnerAccess = (user) => {
  if (!user) return false;

  const roles = user.roles || user.role;
  if (!roles) return false;

  const normalizedRoles = getEffectiveRoles(roles);
  return normalizedRoles.includes(ROLES.DELIVERY_PARTNER);
};
