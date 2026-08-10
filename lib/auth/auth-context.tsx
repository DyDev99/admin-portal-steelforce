'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { authRepository } from './repository';
import { sessionStore } from './session-store';
import { roleHas, roleHasAll, roleHasAny } from './permissions';
import {
  AuthError,
  type AuthEvent,
  type AuthFailureReason,
  type AuthState,
  type Credentials,
  type Permission,
  type Role,
  type Session,
} from './types';

/**
 * Authentication state machine — the Bloc, expressed as a reducer.
 *
 * Transitions are explicit and exhaustive so no code path can leave the app in
 * a half-authenticated state. `initializing` is the entry state: the portal
 * renders nothing until it resolves, which is what prevents a dashboard flash.
 */
export function authReducer(state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case 'restore.started':
      return { status: 'initializing', session: null, error: null };
    case 'restore.succeeded':
    case 'login.succeeded':
      return { status: 'authenticated', session: event.session, error: null };
    case 'restore.failed':
      return { status: 'unauthenticated', session: null, error: null };
    case 'login.started':
      return { status: 'authenticating', session: null, error: null };
    case 'login.failed':
      return { status: 'unauthenticated', session: null, error: event.reason };
    case 'logout':
      return { status: 'unauthenticated', session: null, error: null };
    case 'error.cleared':
      return state.status === 'unauthenticated' ? { ...state, error: null } : state;
    default:
      return state;
  }
}

const INITIAL_STATE: AuthState = { status: 'initializing', session: null, error: null };

interface AuthContextValue {
  status: AuthState['status'];
  session: Session | null;
  error: AuthFailureReason | null;
  user: Session['user'] | null;
  role: Role | null;
  isAuthenticated: boolean;
  /** True until the stored session has been read and verified. */
  isInitializing: boolean;

  signIn: (credentials: Credentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;

  /** Centralised permission checks — never compare roles in a component. */
  can: (permission: Permission) => boolean;
  canAny: (permissions: readonly Permission[]) => boolean;
  canAll: (permissions: readonly Permission[]) => boolean;
  hasRole: (...roles: Role[]) => boolean;

  rememberedEmail: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);
  const expiryTimer = useRef<number | null>(null);

  // ── Session restore ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = sessionStore.read();
      if (!stored) {
        if (!cancelled) dispatch({ type: 'restore.failed' });
        return;
      }
      try {
        const verified = await authRepository.verify(stored);
        if (cancelled) return;
        if (!verified) {
          sessionStore.clear();
          dispatch({ type: 'restore.failed' });
          return;
        }
        sessionStore.write(verified);
        dispatch({ type: 'restore.succeeded', session: verified });
      } catch {
        if (cancelled) return;
        sessionStore.clear();
        dispatch({ type: 'restore.failed' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Expire the session in-tab rather than waiting for the next page load.
  useEffect(() => {
    if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    if (state.status !== 'authenticated') return;

    const remaining = state.session.expiresAt - Date.now();
    if (remaining <= 0) {
      sessionStore.clear();
      dispatch({ type: 'login.failed', reason: 'session_expired' });
      return;
    }
    // setTimeout saturates above ~24.8 days; sessions are far shorter, but
    // clamping keeps the behaviour correct if the TTL is ever raised.
    expiryTimer.current = window.setTimeout(() => {
      sessionStore.clear();
      dispatch({ type: 'login.failed', reason: 'session_expired' });
    }, Math.min(remaining, 2_147_483_647));

    return () => {
      if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    };
  }, [state]);

  const signIn = useCallback(async (credentials: Credentials) => {
    dispatch({ type: 'login.started' });
    try {
      const session = await authRepository.signIn(credentials);
      sessionStore.write(session);
      sessionStore.writeRememberedEmail(credentials.remember ? session.user.email : null);
      dispatch({ type: 'login.succeeded', session });
      return true;
    } catch (error) {
      const reason = error instanceof AuthError ? error.reason : 'unknown';
      dispatch({ type: 'login.failed', reason });
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    const current = state.status === 'authenticated' ? state.session : null;
    sessionStore.clear();
    dispatch({ type: 'logout' });
    await authRepository.signOut(current);
  }, [state]);

  const clearError = useCallback(() => dispatch({ type: 'error.cleared' }), []);

  const role = state.status === 'authenticated' ? state.session.user.role : null;

  const value = useMemo<AuthContextValue>(() => {
    return {
      status: state.status,
      session: state.session,
      error: state.error,
      user: state.status === 'authenticated' ? state.session.user : null,
      role,
      isAuthenticated: state.status === 'authenticated',
      isInitializing: state.status === 'initializing',
      signIn,
      signOut,
      clearError,
      can: (permission) => (role ? roleHas(role, permission) : false),
      canAny: (permissions) => (role ? roleHasAny(role, permissions) : false),
      canAll: (permissions) => (role ? roleHasAll(role, permissions) : false),
      hasRole: (...roles) => (role ? roles.includes(role) : false),
      rememberedEmail: sessionStore.readRememberedEmail(),
    };
  }, [state, role, signIn, signOut, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
