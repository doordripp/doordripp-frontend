export const MANAGED_ROLE_OPTIONS = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access and management capabilities',
    badgeClass: 'bg-black text-white border-black',
    cardClass: 'border-black bg-black text-white'
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage delivery zones, orders, and delivery operations',
    badgeClass: 'bg-gray-800 text-white border-gray-800',
    cardClass: 'border-gray-800 bg-gray-800 text-white'
  },
  {
    id: 'delivery_partner',
    name: 'Delivery Partner',
    description: 'Can manage assigned deliveries and update delivery progress',
    badgeClass: 'bg-gray-600 text-white border-gray-600',
    cardClass: 'border-gray-600 bg-gray-600 text-white'
  }
]

export const normalizeManagedRoles = (roles = []) => {
  const roleArray = Array.isArray(roles) ? roles : [roles]
  return Array.from(new Set(
    roleArray
      .filter(Boolean)
      .map((role) => String(role).toLowerCase().trim())
      .filter((role) => MANAGED_ROLE_OPTIONS.some((option) => option.id === role))
  ))
}

export const getDisplayRoles = (roles = []) => {
  const explicitRoles = normalizeManagedRoles(roles)
  return explicitRoles.length > 0 ? explicitRoles : ['customer']
}

export const getRoleMeta = (roleId) => {
  if (roleId === 'customer') {
    return {
      id: 'customer',
      name: 'Customer',
      description: 'Base shopping access is automatic for every account',
      badgeClass: 'bg-white text-gray-700 border-gray-300',
      cardClass: 'border-gray-200 bg-gray-50 text-gray-900'
    }
  }

  return MANAGED_ROLE_OPTIONS.find((role) => role.id === roleId)
}
