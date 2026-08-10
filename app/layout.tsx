import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'SteelForce — Admin Portal',
  description: 'Premium steel distribution and sales management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <I18nProvider>
            {/* Above the router, so the login screen, the error pages and the
                portal all read one session. */}
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
