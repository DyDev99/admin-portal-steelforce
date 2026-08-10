'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { landingRouteFor } from '@/lib/auth/authorization';
import { SplashScreen } from '@/components/auth/splash-screen';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Entry route. Resolves the session first, then sends the user to the landing
 * page their role actually has — never straight to the dashboard on faith.
 */
export default function Home() {
  const { status, isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'initializing') return;
    router.replace(isAuthenticated && role ? landingRouteFor(role) : '/login');
  }, [status, isAuthenticated, role, router]);

  return <SplashScreen />;
}
