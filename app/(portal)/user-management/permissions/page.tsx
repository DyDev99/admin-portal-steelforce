'use client';

import { UserManagementNav } from '@/components/user-management/user-management-nav';
import { useI18n } from '@/lib/i18n';

export default function PermissionsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <UserManagementNav />
      <div className="rounded-3xl border border-surface bg-slate-950/30 p-6">
        <h1 className="text-[22px] font-bold text-white">{t('um.perms.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('um.perms.subtitle')}</p>
      </div>
    </div>
  );
}
