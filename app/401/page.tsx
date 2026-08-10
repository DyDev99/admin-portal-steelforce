'use client';

import { ErrorPage } from '@/components/auth/error-page';
import { KeyRound } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <ErrorPage
      code="401"
      title="Authentication required"
      description="You need to sign in before you can open this page. Your session may have expired."
      icon={KeyRound}
      tone="#F59E0B"
    />
  );
}
