import type { Session } from './types';

const SESSION_KEY = 'steelforce.session';
const REMEMBERED_EMAIL_KEY = 'steelforce.remembered-email';

/**
 * Session persistence.
 *
 * "Remember me" decides the backing store rather than a flag inside the
 * payload: durable sessions go to localStorage, everything else to
 * sessionStorage so closing the tab ends the session.
 */
function storeFor(persistent: boolean): Storage | null {
  if (typeof window === 'undefined') return null;
  return persistent ? window.localStorage : window.sessionStorage;
}

export const sessionStore = {
  read(): Session | null {
    if (typeof window === 'undefined') return null;
    for (const store of [window.localStorage, window.sessionStorage]) {
      try {
        const raw = store.getItem(SESSION_KEY);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as Session;
        if (parsed?.user?.id && parsed?.token && typeof parsed.expiresAt === 'number') {
          return parsed;
        }
        // Malformed payload — drop it rather than fail the whole boot.
        store.removeItem(SESSION_KEY);
      } catch {
        // Storage disabled or JSON corrupt; treat as signed out.
      }
    }
    return null;
  },

  write(session: Session): void {
    const store = storeFor(session.persistent);
    if (!store) return;
    try {
      // Clear the other store so a session can never exist in both.
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
      store.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Private mode: the session simply won't survive a reload.
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Nothing to do — the in-memory state is authoritative for this tab.
    }
  },

  /** Email only. The password is never persisted anywhere. */
  readRememberedEmail(): string {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';
    } catch {
      return '';
    }
  },

  writeRememberedEmail(email: string | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (email) window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      else window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch {
      // Non-fatal.
    }
  },
};
