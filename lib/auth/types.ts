/**
 * Authentication & authorization domain model.
 *
 * Nothing in this file knows how credentials are checked or where a session is
 * stored — those are repository concerns. Swapping the static repository for a
 * JWT-backed one must not require touching these types.
 */

export const ROLES = ['Admin', 'SalesRepManager', 'SalesAdmin', 'Finance'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Permissions are `module.action`. Screens and menu items declare the
 * permission they require; nothing checks a role name directly.
 */
export const PERMISSIONS = [
  'dashboard.view',

  'customers.view',
  'customers.manage',

  'sales.view',
  'sales.manage',

  'products.view',

  'field.view',
  'field.manage',

  'reports.view',

  'users.manage',
  'roles.manage',
  'settings.manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Two-letter fallback avatar. */
  initials: string;
  jobTitle: string;
  department: string;
}

/**
 * Shape a JWT session would take, so the static implementation and a future
 * real one are interchangeable. `token` is opaque to every consumer.
 */
export interface Session {
  user: User;
  token: string;
  issuedAt: number;
  expiresAt: number;
  /** Remember Me — decides durable vs tab-scoped storage. */
  persistent: boolean;
}

export interface Credentials {
  email: string;
  password: string;
  remember: boolean;
}

export type AuthFailureReason =
  | 'invalid_credentials'
  | 'account_disabled'
  | 'session_expired'
  | 'unknown';

export class AuthError extends Error {
  constructor(
    public readonly reason: AuthFailureReason,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Finite auth states. The portal renders only in `authenticated`; every other
 * state shows the splash or the login screen, which is what guarantees the
 * dashboard is never painted before the session is resolved.
 */
export type AuthStatus = 'initializing' | 'authenticating' | 'authenticated' | 'unauthenticated';

export type AuthState =
  | { status: 'initializing'; session: null; error: null }
  | { status: 'authenticating'; session: null; error: null }
  | { status: 'authenticated'; session: Session; error: null }
  | { status: 'unauthenticated'; session: null; error: AuthFailureReason | null };

/** Events the reducer accepts — the Bloc event set, in TypeScript. */
export type AuthEvent =
  | { type: 'restore.started' }
  | { type: 'restore.succeeded'; session: Session }
  | { type: 'restore.failed' }
  | { type: 'login.started' }
  | { type: 'login.succeeded'; session: Session }
  | { type: 'login.failed'; reason: AuthFailureReason }
  | { type: 'logout' }
  | { type: 'error.cleared' };
