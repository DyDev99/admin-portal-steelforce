import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/auth/guards';

/**
 * Every portal route sits behind the guard. The shell is not mounted until a
 * session exists and the role is authorised for the requested path, so no
 * protected screen can paint first — including on a direct URL entry.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
