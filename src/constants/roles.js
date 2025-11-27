// Role Constants
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const PERMISSIONS = {
  READ_USERS: 'read_users',
  WRITE_USERS: 'write_users',
  READ_PRODUCTS: 'read_products',
  WRITE_PRODUCTS: 'write_products',
  READ_ORDERS: 'read_orders',
  WRITE_ORDERS: 'write_orders'
};

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [],
  [ROLES.ADMIN]: [
    PERMISSIONS.READ_USERS,
    PERMISSIONS.READ_PRODUCTS,
    PERMISSIONS.WRITE_PRODUCTS,
    PERMISSIONS.READ_ORDERS,
    PERMISSIONS.WRITE_ORDERS
  ],
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS)
};