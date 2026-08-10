'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Lock, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { fetchRoles, fetchUserCountsByRole } from '@/lib/mock-store';
import type { Role } from '@/lib/types';
import { UserManagementNav } from '@/components/user-management/user-management-nav';

export default function RolesPage() {
  const { t } = useI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    const [nextRoles, counts] = await Promise.all([fetchRoles(), fetchUserCountsByRole()]);
    setRoles(nextRoles);
    setUserCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const systemRoles = roles.filter((r) => r.is_system);
  const customRoles = roles.filter((r) => !r.is_system);

  const roleColors: Record<string, string> = {
    'Super Admin': 'from-red-500 to-rose-600',
    'Administrator': 'from-orange-500 to-amber-600',
    'Manager': 'from-blue-500 to-blue-600',
    'Sales Supervisor': 'from-sky-500 to-sky-600',
    'Sales Representative': 'from-green-500 to-green-600',
    'Finance': 'from-emerald-500 to-teal-600',
    'Warehouse': 'from-amber-500 to-yellow-600',
    'Customer Service': 'from-purple-500 to-violet-600',
    'Viewer': 'from-gray-500 to-gray-600',
  };

  return (
    <div className="space-y-5">
      <UserManagementNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-main">{t('um.roles.title')}</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">{t('um.roles.subtitle')}</p>
        </div>
        <Button size="sm" className="rounded-xl gradient-primary text-white border-0">
          <Plus size={15} className="mr-1.5" /> {t('um.roles.addRole')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-surface card-shadow" style={{ borderRadius: '16px' }}>
          <p className="text-[11px] text-muted-foreground font-medium">{t('um.roles.totalRoles')}</p>
          <p className="text-[24px] font-bold text-blue-600 mt-1">{roles.length}</p>
        </Card>
        <Card className="p-4 border-surface card-shadow" style={{ borderRadius: '16px' }}>
          <p className="text-[11px] text-muted-foreground font-medium">{t('um.roles.systemRoles')}</p>
          <p className="text-[24px] font-bold text-amber-600 mt-1">{systemRoles.length}</p>
        </Card>
      </div>

      {/* System Roles */}
      <div>
        <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Lock size={14} /> {t('um.roles.systemRoles')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
            ))
          ) : (
            systemRoles.map((role, i) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 border-surface card-shadow hover:card-shadow-hover transition-all duration-300" style={{ borderRadius: '18px' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role.name] || 'from-blue-500 to-blue-600'} flex items-center justify-center shadow-md`}>
                      <Shield size={18} className="text-white" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      {t('um.roles.systemRole')}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-main">{role.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-surface">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Users size={13} /> {userCounts[role.id] || 0} {t('um.roles.users')}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Shield size={13} /> {Object.keys(role.permissions).length} {t('um.roles.permissions')}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Custom Roles */}
      {customRoles.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('um.roles.customRoles')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map((role, i) => (
              <motion.div key={role.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 border-surface card-shadow" style={{ borderRadius: '18px' }}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-md">
                    <Shield size={18} className="text-white" />
                  </div>
                  <h4 className="text-[14px] font-bold text-main mt-3">{role.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">{role.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
