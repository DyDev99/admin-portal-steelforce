'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Users,
  ShoppingCart,
  FileText,
  UserCheck,
  Bell,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const navConfig = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/visits', labelKey: 'nav.visits', icon: MapPin },
  { href: '/sales-reps', labelKey: 'nav.salesReps', icon: UserCheck },
  { href: '/orders', labelKey: 'nav.orders', icon: ShoppingCart },
  { href: '/quotations', labelKey: 'nav.quotations', icon: FileText },
  { href: '/customers', labelKey: 'nav.customers', icon: Users },
  { href: '/user-management', labelKey: 'nav.userManagement', icon: ShieldCheck },
  { href: '/notifications', labelKey: 'nav.notifications', icon: Bell, badge: 5 },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
];

const COLLAPSE_KEY = 'steelforce-sidebar-collapsed';

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    if (stored !== null) setCollapsed(stored === 'true');
    setMounted(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return { collapsed, toggle, mounted };
}

function NavItem({
  href,
  labelKey,
  icon: Icon,
  badge,
  isActive,
  collapsed,
  onNavigate,
  t,
  index,
}: {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
  t: (k: string) => string;
  index: number;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link
        href={href}
        onClick={onNavigate}
        className={`group relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-2xl transition-all duration-200 ${
          isActive
            ? 'sidebar-item-active text-white'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-primary'
        }`}
      >
        <Icon
          className={`flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'
          }`}
          size={19}
          strokeWidth={isActive ? 2.5 : 1.8}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className={`text-[13.5px] font-medium whitespace-nowrap ${
                isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'
              }`}
            >
              {t(labelKey)}
            </motion.span>
          )}
        </AnimatePresence>
        {badge && !isActive && !collapsed && (
          <span className="ml-auto flex items-center justify-center text-[10px] font-bold rounded-full w-5 h-5 bg-red-500 text-white">
            {badge}
          </span>
        )}
      </Link>

      <AnimatePresence>
        {collapsed && showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 glass rounded-xl px-3 py-2 card-shadow z-50 pointer-events-none whitespace-nowrap"
          >
            <span className="text-[12px] font-medium text-main">{t(labelKey)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavContent({
  pathname,
  onNavigate,
  collapsed,
  toggleCollapse,
  t,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
  t: (k: string) => string;
}) {
  return (
    <>
      {/* Logo + Collapse Button */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-surface`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200/50 overflow-hidden">
            <Image src="/logos/Square.png" alt="Admin Portal Logo" width={36} height={36} className="object-contain" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[15px] font-extrabold text-main leading-tight">{t('app.name')}</p>
                <p className="text-[10px] text-primary font-medium uppercase tracking-widest">{t('app.portal')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Collapse sidebar"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-primary transition-all duration-200"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-3"
            >
              {t('nav.mainMenu')}
            </motion.p>
          )}
        </AnimatePresence>
        {navConfig.map(({ href, labelKey, icon, badge }, idx) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <NavItem
              key={href}
              href={href}
              labelKey={labelKey}
              icon={icon}
              badge={badge}
              isActive={isActive}
              collapsed={collapsed}
              onNavigate={onNavigate}
              t={t}
              index={idx}
            />
          );
        })}
      </nav>

      {/* Collapse expand button (when collapsed) */}
      {collapsed && (
        <div className="px-3 pb-2">
          <button
            onClick={toggleCollapse}
            aria-label="Expand sidebar"
            className="w-full flex items-center justify-center py-2.5 rounded-2xl text-muted-foreground hover:bg-accent/50 hover:text-primary transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Bottom user */}
      <div className="p-3 border-t border-surface">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-2xl hover:bg-accent/30 cursor-pointer transition-all duration-200`}>
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AR</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[12px] font-semibold text-main truncate">Ahmad Reza</p>
                <p className="text-[10px] text-muted-foreground">{t('header.salesManager')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
  collapsed,
  toggleCollapse,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-sidebar border-r border-surface card-shadow fixed left-0 top-0 h-screen z-20 overflow-hidden"
      >
        <NavContent
          pathname={pathname}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
          t={t}
        />
      </motion.aside>

      {/* Spacer to offset fixed sidebar */}
      <motion.div
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block flex-shrink-0"
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-sidebar border-r border-surface z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent/50 transition-colors z-10"
              >
                <X size={18} />
              </button>
              <NavContent
                pathname={pathname}
                onNavigate={onClose}
                collapsed={false}
                toggleCollapse={() => {}}
                t={t}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
