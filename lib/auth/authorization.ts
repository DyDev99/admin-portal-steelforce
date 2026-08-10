import { roleHas } from './permissions';
import type { Permission, Role } from './types';

/**
 * Route authorization.
 *
 * Every protected path resolves to exactly one permission through this table.
 * Guards, the sidebar and any future middleware all read it, so a route can
 * never be protected in one place and open in another.
 */
export interface RouteRule {
  prefix: string;
  /** `null` means any authenticated user may enter. */
  permission: Permission | null;
}

/** Order is irrelevant — the longest matching prefix always wins. */
export const ROUTE_RULES: RouteRule[] = [
  { prefix: '/dashboard', permission: 'dashboard.view' },

  { prefix: '/customers', permission: 'customers.view' },
  { prefix: '/customers/new', permission: 'customers.manage' },

  { prefix: '/quotations', permission: 'sales.view' },
  { prefix: '/orders', permission: 'sales.view' },
  { prefix: '/opportunities', permission: 'sales.view' },

  { prefix: '/products', permission: 'products.view' },

  { prefix: '/planning', permission: 'field.view' },
  { prefix: '/sales-reps', permission: 'field.view' },
  { prefix: '/visits', permission: 'field.view' },
  { prefix: '/field', permission: 'field.view' },

  { prefix: '/reports', permission: 'reports.view' },

  { prefix: '/user-management', permission: 'users.manage' },
  { prefix: '/user-management/roles', permission: 'roles.manage' },
  { prefix: '/user-management/permissions', permission: 'roles.manage' },

  { prefix: '/settings', permission: 'settings.manage' },

  // Available to anyone with a session.
  { prefix: '/profile', permission: null },
  { prefix: '/notifications', permission: null },
];

/** Paths that render without a session. Everything else requires one. */
export const PUBLIC_ROUTES = ['/login', '/401', '/403'];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Longest-prefix match, so `/user-management/roles` resolves to `roles.manage`
 * rather than the broader `users.manage` rule it also matches.
 */
export function ruleForRoute(pathname: string): RouteRule | null {
  let best: RouteRule | null = null;
  for (const rule of ROUTE_RULES) {
    const matches = pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`);
    if (!matches) continue;
    if (!best || rule.prefix.length > best.prefix.length) best = rule;
  }
  return best;
}

export type RouteDecision =
  | { allowed: true }
  | { allowed: false; reason: 'unauthenticated' | 'forbidden' | 'unknown_route' };

/**
 * The one function that decides whether a role may open a path. Guards call
 * it; nothing re-implements the logic.
 */
export function authorizeRoute(pathname: string, role: Role | null): RouteDecision {
  if (isPublicRoute(pathname)) return { allowed: true };
  if (!role) return { allowed: false, reason: 'unauthenticated' };

  const rule = ruleForRoute(pathname);
  // Unmapped paths are denied rather than allowed: a new route is protected by
  // default, and forgetting to add a rule fails closed.
  if (!rule) return { allowed: false, reason: 'unknown_route' };
  if (rule.permission === null) return { allowed: true };

  return roleHas(role, rule.permission)
    ? { allowed: true }
    : { allowed: false, reason: 'forbidden' };
}

/**
 * Where to send a role after login, or when it is bounced off a page it may
 * not see. Every role currently holds `dashboard.view`, but this resolves the
 * first landing page it actually has rather than assuming.
 */
export function landingRouteFor(role: Role): string {
  if (roleHas(role, 'dashboard.view')) return '/dashboard';
  const fallback = ROUTE_RULES.find(
    (rule) => rule.permission !== null && roleHas(role, rule.permission)
  );
  return fallback?.prefix ?? '/profile';
}
