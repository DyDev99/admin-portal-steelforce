'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { useSidebarCollapse } from '@/hooks/use-sidebar';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggle: toggleCollapse } = useSidebarCollapse();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCollapse]);

  return (
    <div className="flex min-h-screen bg-surface relative">
      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {/* Keyed on pathname so each route plays an enter animation.
                Deliberately no AnimatePresence/exit here: `mode="wait"` holds the
                incoming route until the outgoing exit animation reports done,
                which never fires in a production build and silently swallows
                every client-side navigation. */}
            <div key={pathname} className="max-w-[1600px] mx-auto">
              {/* No `filter` in this transition, deliberately. A filtered element
                  becomes the containing block for `position: fixed` descendants
                  (drawers and modals would anchor to this wrapper instead of the
                  viewport) and it suppresses `backdrop-filter` on everything
                  inside, which flattens the glass surfaces. Framer resets the
                  transform to `none` once y settles, so opacity + y is safe. */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
