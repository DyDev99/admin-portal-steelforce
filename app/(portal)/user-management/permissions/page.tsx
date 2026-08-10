'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { fetchRoles, updateRolePermissions } from '@/lib/mock-store';
import { PERMISSION_MODULES, PERMISSION_ACTIONS, type Role } from '@/lib/types';
import { UserManagementNav } from '@/components/user-management/user-management-nav';

/** Action keys map onto `um.perms.*` labels; reset_password is camelCased there. */
const actionLabelKey: Record<string, string> = {
  view: 'um.perms.view',
  create: 'um.perms.create',
  edit: 'um.perms.edit',
  update: 'um.perms.update',
  delete: 'um.perms.delete',
  export: 'um.perms.export',
  manage: 'um.perms.manage',
  reset_password: 'um.perms.resetPassword',
};

export default function PermissionsPage() {
  const { t } = useI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    const rls = await fetchRoles();
    setRoles(rls);
    if (rls.length > 0) {
      setSelectedRoleId((prev) => (prev && rls.some((r) => r.id === prev) ? prev : rls[0].id));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  // Reset the working copy whenever a different role is picked.
  useEffect(() => {
    setMatrix(selectedRole ? { ...(selectedRole.permissions || {}) } : {});
  }, [selectedRole]);

  const isChecked = (module: string, action: string) => (matrix[module] || []).includes(action);

  const toggle = (module: string, action: string) => {
    setMatrix((prev) => {
      const current = prev[module] || [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [module]: next };
    });
  };

  const toggleModule = (module: string) => {
    setMatrix((prev) => {
      const current = prev[module] || [];
      const all = [...PERMISSION_ACTIONS] as string[];
      return { ...prev, [module]: current.length === all.length ? [] : all };
    });
  };

  const isDirty = useMemo(() => {
    if (!selectedRole) return false;
    const original = selectedRole.permissions || {};
    return PERMISSION_MODULES.some((m) => {
      const a = [...(original[m] || [])].sort().join(',');
      const b = [...(matrix[m] || [])].sort().join(',');
      return a !== b;
    });
  }, [selectedRole, matrix]);

  const handleSave = async () => {
    if (!selectedRole) return;

    setSaving(true);
    // Store only the known modules so stray keys never leak in.
    const payload: Record<string, string[]> = {};
    for (const m of PERMISSION_MODULES) payload[m] = matrix[m] || [];

    await updateRolePermissions(selectedRole.id, payload);
    setSaving(false);
    toast.success(t('um.perms.saved'));
    loadRoles();
  };

  const grantedCount = useMemo(
    () => PERMISSION_MODULES.reduce((sum, m) => sum + (matrix[m] || []).length, 0),
    [matrix]
  );

  return (
    <div className="space-y-5">
      <UserManagementNav />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-main">{t('um.perms.title')}</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">{t('um.perms.subtitle')}</p>
        </div>
        <Button
          size="sm"
          className="rounded-xl gradient-primary text-white border-0"
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          <Save size={15} className="mr-1.5" /> {saving ? t('um.perms.saving') : t('button.save')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-16 rounded-2xl bg-muted/30 animate-pulse" />
          <div className="h-80 rounded-2xl bg-muted/30 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Role selector */}
          <Card className="p-4 border-surface card-shadow" style={{ borderRadius: '18px' }}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t('um.perms.selectRole')}
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedRoleId === role.id
                      ? 'gradient-primary text-white shadow-md shadow-blue-200/50'
                      : 'text-muted-foreground hover:bg-accent/50'
                  }`}
                >
                  {role.is_system && <Lock size={12} />}
                  {role.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Summary */}
          {selectedRole && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 border-surface card-shadow" style={{ borderRadius: '16px' }}>
                <p className="text-[11px] text-muted-foreground font-medium">{t('um.roles.roleName')}</p>
                <p className="text-[16px] font-bold text-main mt-1 truncate">{selectedRole.name}</p>
              </Card>
              <Card className="p-4 border-surface card-shadow" style={{ borderRadius: '16px' }}>
                <p className="text-[11px] text-muted-foreground font-medium">{t('um.roles.permissions')}</p>
                <p className="text-[24px] font-bold text-blue-600 mt-1">{grantedCount}</p>
              </Card>
              <Card className="p-4 border-surface card-shadow hidden lg:block" style={{ borderRadius: '16px' }}>
                <p className="text-[11px] text-muted-foreground font-medium">{t('um.perms.module')}</p>
                <p className="text-[24px] font-bold text-green-600 mt-1">{PERMISSION_MODULES.length}</p>
              </Card>
            </div>
          )}

          {/* Matrix */}
          <Card className="border-surface card-shadow overflow-hidden" style={{ borderRadius: '18px' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 sticky left-0 bg-muted/30">
                      {t('um.perms.module')}
                    </th>
                    {PERMISSION_ACTIONS.map((action) => (
                      <th
                        key={action}
                        className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-3 whitespace-nowrap"
                      >
                        {t(actionLabelKey[action])}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_MODULES.map((module, i) => (
                    <motion.tr
                      key={module}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-t border-surface hover:bg-accent/20 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 sticky left-0 bg-card">
                        <button
                          onClick={() => toggleModule(module)}
                          className="flex items-center gap-2 text-[12px] font-semibold text-main hover:text-primary transition-colors"
                        >
                          <Shield size={14} className="text-primary" />
                          {t(`um.perms.${module}`)}
                        </button>
                      </td>
                      {PERMISSION_ACTIONS.map((action) => (
                        <td key={action} className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggle(module, action)}
                            aria-label={`${module} ${action}`}
                            aria-pressed={isChecked(module, action)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center mx-auto transition-all duration-150 ${
                              isChecked(module, action)
                                ? 'gradient-primary border-transparent text-white shadow-sm'
                                : 'border-surface text-transparent hover:border-primary/40 hover:bg-accent/40'
                            }`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
