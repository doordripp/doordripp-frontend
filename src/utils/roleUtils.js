// Role Management Utilities
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const checkRole = (userRole, requiredRole) => {
  if (!userRole) return false
  // Normalize to array
  const roles = Array.isArray(userRole) ? userRole : [userRole]
  return roles.includes(requiredRole)
};

export const hasAdminAccess = (user) => {
  if (!user) return false
  const roles = user?.roles || user?.role || []
  const roleArray = Array.isArray(roles) ? roles : [roles]
  return roleArray.includes(ROLES.ADMIN) || roleArray.includes(ROLES.SUPER_ADMIN)
};