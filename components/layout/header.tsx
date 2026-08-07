'use client';

import { Search, Bell, MessageSquare, ChevronRight, Menu, Command } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useI18n } from '@/lib/i18n';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const { t } = useI18n();

  const pageMap: Record<string, { titleKey: string; subtitleKey: string }> = {
    '/dashboard': { titleKey: 'page.dashboard.title', subtitleKey: 'page.dashboard.subtitle' },
    '/visits': { titleKey: 'page.visits.title', subtitleKey: 'page.visits.subtitle' },
    '/sales-reps': { titleKey: 'page.salesReps.title', subtitleKey: 'page.salesReps.subtitle' },
    '/orders': { titleKey: 'page.orders.title', subtitleKey: 'page.orders.subtitle' },
    '/quotations': { titleKey: 'page.quotations.title', subtitleKey: 'page.quotations.subtitle' },
    '/customers': { titleKey: 'page.customers.title', subtitleKey: 'page.customers.subtitle' },
    '/user-management': { titleKey: 'um.title', subtitleKey: 'um.subtitle' },
    '/notifications': { titleKey: 'page.notifications.title', subtitleKey: 'page.notifications.subtitle' },
    '/profile': { titleKey: 'page.profile.title', subtitleKey: 'page.profile.subtitle' },
  };

  const page = pageMap[pathname] || { titleKey: 'page.dashboard.title', subtitleKey: 'page.dashboard.subtitle' };
  const pageTitle = t(page.titleKey);

  return (
    <header className="sticky top-0 z-30 h-[80px] glass border-b border-surface">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-accent/50 transition-all"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1"
            >
              <span className="font-medium hidden sm:inline">{t('breadcrumb.home')}</span>
              <ChevronRight size={12} className="hidden sm:inline" />
              <span className="text-primary font-medium">{pageTitle}</span>
            </motion.div>
            <motion.h1
              key={pageTitle}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[18px] sm:text-[22px] font-bold text-main leading-tight truncate"
            >
              {pageTitle}
            </motion.h1>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('header.search')}
              className="w-full h-11 pl-11 pr-16 rounded-2xl bg-background/50 border border-surface text-[13px] text-main placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 px-2 py-1 rounded-md bg-muted/50 border border-surface text-[10px] text-muted-foreground font-medium">
              <Command size={9} />K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 relative">
            <MessageSquare size={19} strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 relative"
            >
              <motion.div
                animate={{ rotate: showNotif ? 15 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Bell size={19} strokeWidth={1.8} />
              </motion.div>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            <AnimatePresence>
              {showNotif && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-80 glass rounded-2xl card-shadow p-4 z-50"
                  >
                    <p className="text-[13px] font-bold text-main mb-3">{t('header.notifications')}</p>
                    <div className="space-y-2">
                      {[
                        { title: t('notif.orderApproved'), desc: t('notif.orderApprovedDesc'), time: '2m' },
                        { title: t('notif.quotationRejected'), desc: t('notif.quotationRejectedDesc'), time: '1h' },
                        { title: t('notif.lowStock'), desc: t('notif.lowStockDesc'), time: '2h' },
                      ].map((n, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-accent/30 transition-colors cursor-pointer">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-main">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <LanguageSwitcher />
          <ThemeToggle />

          <div className="w-px h-8 bg-surface mx-1 hidden sm:block" />

          <button className="flex items-center gap-2.5 pl-1 pr-2 sm:pr-3 py-1.5 rounded-xl hover:bg-accent/30 transition-all duration-200">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-blue-200/50">
              <span className="text-white text-xs font-bold">AR</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-main leading-tight">Ahmad Reza</p>
              <p className="text-[10px] text-muted-foreground">{t('header.salesManager')}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
