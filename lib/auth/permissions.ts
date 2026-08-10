import { PERMISSIONS, type Permission, type Role } from './types';

/**
 * The single authorization matrix.
 *
 * Every access decision in the app — sidebar visibility, route guards,
 * conditional actions — resolves through this table. No component checks a
 * role name, so changing what a role can do is a one-line edit here.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  /** Full access, including everything added in future. */
  Admin: PERMISSIONS,

  /** Runs the field team: all commercial modules, no system administration. */
  SalesRepManager: [
    'dashboard.view',
    'customers.view',
    'customers.manage',
    'sales.view',
    'sales.manage',
    'products.view',
    'field.view',
    'field.manage',
    'reports.view',
  ],

  /** Inside sales: commercial modules without field operations. */
  SalesAdmin: [
    'dashboard.view',
    'customers.view',
    'customers.manage',
    'sales.view',
    'sales.manage',
    'products.view',
    'reports.view',
  ],

  /** Read-only commercial visibility for finance. */
  Finance: ['dashboard.view', 'sales.view', 'reports.view'],
};

export interface RoleMeta {
  label: string;
  description: string;
  /** Tailwind classes for the role badge — tone only, no layout. */
  badge: string;
}

export const ROLE_META: Record<Role, RoleMeta> = {
  Admin: {
    label: 'Administrator',
    description: 'Full access to every module and system setting',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },
  SalesRepManager: {
    label: 'Sales Rep Manager',
    description: 'Commercial modules and field operations',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  SalesAdmin: {
    label: 'Sales Admin',
    description: 'Commercial modules without field operations',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  Finance: {
    label: 'Finance',
    description: 'Sales and reporting visibility',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
};

/** Permission set for a role, memoised — the matrix is read on every render. */
const permissionSets = new Map<Role, Set<Permission>>();

export function permissionsFor(role: Role): Set<Permission> {
  let set = permissionSets.get(role);
  if (!set) {
    set = new Set(ROLE_PERMISSIONS[role]);
    permissionSets.set(role, set);
  }
  return set;
}

export function roleHas(role: Role, permission: Permission): boolean {
  return permissionsFor(role).has(permission);
}

export function roleHasAny(role: Role, permissions: readonly Permission[]): boolean {
  if (permissions.length === 0) return true;
  const set = permissionsFor(role);
  return permissions.some((p) => set.has(p));
}

export function roleHasAll(role: Role, permissions: readonly Permission[]): boolean {
  const set = permissionsFor(role);
  return permissions.every((p) => set.has(p));
}
