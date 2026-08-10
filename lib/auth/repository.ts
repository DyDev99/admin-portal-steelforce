import { AuthError, type Credentials, type Session, type User } from './types';

/** Eight hours, matching a typical access-token lifetime. */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/**
 * The contract the rest of the app codes against.
 *
 * This is the seam for a real backend: implement `AuthRepository` against
 * `POST /auth/login` and `GET /auth/me`, swap the instance exported at the
 * bottom of this file, and no UI, guard or state code changes.
 */
export interface AuthRepository {
  /** Verifies credentials and issues a session. Throws `AuthError` on failure. */
  signIn(credentials: Credentials): Promise<Session>;
  /** Invalidates the session server-side (a no-op for the static build). */
  signOut(session: Session | null): Promise<void>;
  /** Revalidates a restored session; returns null when it is no longer good. */
  verify(session: Session): Promise<Session | null>;
}

/**
 * Demo directory.
 *
 * Passwords live here and nowhere else — they are never placed in component
 * state, never rendered, and never written to storage. A real implementation
 * deletes this constant entirely.
 */
interface StaticAccount {
  user: User;
  password: string;
  disabled?: boolean;
}

const ACCOUNTS: StaticAccount[] = [
  {
    password: 'Admin@123',
    user: {
      id: 'USR-001',
      name: 'Ahmad Reza',
      email: 'admin@steelforce.com',
      role: 'Admin',
      initials: 'AR',
      jobTitle: 'System Administrator',
      department: 'Information Technology',
    },
  },
  {
    password: 'Manager@123',
    user: {
      id: 'USR-002',
      name: 'Sok Dara',
      email: 'manager@steelforce.com',
      role: 'SalesRepManager',
      initials: 'SD',
      jobTitle: 'Sales Rep Manager',
      department: 'Field Sales',
    },
  },
  {
    password: 'Sales@123',
    user: {
      id: 'USR-003',
      name: 'Chan Sopheak',
      email: 'salesadmin@steelforce.com',
      role: 'SalesAdmin',
      initials: 'CS',
      jobTitle: 'Sales Administrator',
      department: 'Inside Sales',
    },
  },
  {
    password: 'Finance@123',
    user: {
      id: 'USR-004',
      name: 'Heng Kanha',
      email: 'finance@steelforce.com',
      role: 'Finance',
      initials: 'HK',
      jobTitle: 'Finance Controller',
      department: 'Finance',
    },
  },
];

/**
 * Accounts offered on the login screen. Deliberately carries no password —
 * the form asks the repository to fill the field, so the secret never enters
 * component state or the DOM.
 */
export const DEMO_DIRECTORY = ACCOUNTS.map(({ user }) => ({
  email: user.email,
  name: user.name,
  role: user.role,
  jobTitle: user.jobTitle,
}));

function issueSession(user: User, persistent: boolean): Session {
  const issuedAt = Date.now();
  return {
    user,
    // Stands in for a JWT. Opaque to every consumer, exactly like a real one.
    token: `static.${btoa(`${user.id}:${issuedAt}`)}.demo`,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_MS,
    persistent,
  };
}

/** Keeps the sign-in button's pending state visible, as a network call would. */
function latency<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class StaticAuthRepository implements AuthRepository {
  async signIn({ email, password, remember }: Credentials): Promise<Session> {
    await latency(null);

    const account = ACCOUNTS.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase()
    );

    // Same error for unknown email and wrong password: revealing which one
    // was wrong hands an attacker a valid-account oracle.
    if (!account || account.password !== password) {
      throw new AuthError('invalid_credentials', 'Email or password is incorrect.');
    }
    if (account.disabled) {
      throw new AuthError('account_disabled', 'This account has been disabled.');
    }

    return issueSession(account.user, remember);
  }

  async signOut(_session: Session | null): Promise<void> {
    // A real implementation revokes the refresh token here.
    await latency(null, 250);
  }

  async verify(session: Session): Promise<Session | null> {
    if (session.expiresAt <= Date.now()) return null;
    // Re-read the user so role changes take effect on the next page load,
    // rather than persisting whatever was serialised at sign-in.
    const account = ACCOUNTS.find((a) => a.user.id === session.user.id);
    if (!account || account.disabled) return null;
    return { ...session, user: account.user };
  }

  /** Used by the login form's demo shortcuts; never returns to the UI layer. */
  passwordFor(email: string): string | null {
    return ACCOUNTS.find((a) => a.user.email === email)?.password ?? null;
  }
}

export const authRepository = new StaticAuthRepository();
