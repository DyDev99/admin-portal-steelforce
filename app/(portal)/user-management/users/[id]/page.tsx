'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pencil,
  KeyRound,
  Power,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  User,
  Shield,
  Clock,
  AlertCircle,
  Lock,
  Unlock,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import {
  fetchUserById,
  resetUserPassword,
  setUserStatus,
  unlockUser,
  updateUser,
} from '@/lib/mock-store';
import type { AppUserWithRelations } from '@/lib/types';

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  disabled: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  locked: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
};

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, formatDate } = useI18n();
  const [user, setUser] = useState<AppUserWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setUser(await fetchUserById(id as string));
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleToggleStatus = async (currentStatus: string) => {
    await setUserStatus(id as string, currentStatus === 'active' ? 'disabled' : 'active');
    fetchUser();
  };

  const handleLockUnlock = async (currentStatus: string) => {
    if (currentStatus === 'locked') await unlockUser(id as string);
    else await updateUser(id as string, { account_status: 'locked' });
    fetchUser();
  };

  const handleResetPassword = async () => {
    const tempPwd = generatePassword();
    await resetUserPassword(id as string, tempPwd);
    toast.success(`${t('um.actions.resetPassword')}: ${tempPwd}`, { duration: 10000 });
    fetchUser();
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-32 rounded-xl bg-muted/30 animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />
          <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-[14px]">{t('um.users.noResults')}</p>
        <Button className="mt-4 rounded-xl" onClick={() => router.push('/user-management/users')}>
          {t('um.detail.back')}
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const infoSections = [
    {
      title: t('um.detail.personal'),
      icon: User,
      items: [
        { icon: User, label: t('um.col.fullName'), value: user.full_name },
        { icon: User, label: t('um.col.employeeId'), value: user.employee_id || '—' },
        { icon: User, label: t('um.col.gender'), value: user.gender || '—' },
        { icon: Calendar, label: t('um.col.birthday'), value: user.birthday ? formatDate(user.birthday) : '—' },
        { icon: Mail, label: t('um.col.email'), value: user.email || '—' },
        { icon: Phone, label: t('um.col.phone'), value: user.phone || '—' },
        { icon: MapPin, label: t('um.col.address'), value: user.address || '—' },
      ],
    },
    {
      title: t('um.detail.company'),
      icon: Building2,
      items: [
        { icon: Building2, label: t('um.col.department'), value: user.department?.name || '—' },
        { icon: User, label: t('um.col.position'), value: user.position || '—' },
        { icon: Shield, label: t('um.col.role'), value: user.role?.name || '—' },
        { icon: User, label: t('um.col.manager'), value: user.manager_name || '—' },
        { icon: Calendar, label: t('um.col.joinDate'), value: user.join_date ? formatDate(user.join_date) : '—' },
        { icon: User, label: t('um.col.employmentStatus'), value: user.employment_status },
      ],
    },
    {
      title: t('um.detail.system'),
      icon: Shield,
      items: [
        { icon: User, label: t('um.col.username'), value: user.username },
        { icon: Shield, label: t('um.col.userId'), value: user.id.slice(0, 8) },
        { icon: Shield, label: t('um.col.accountStatus'), value: t(`um.status.${user.account_status}`) },
        { icon: Clock, label: t('um.col.lastLogin'), value: user.last_login ? formatDate(user.last_login, { dateStyle: 'medium', timeStyle: 'short' }) : t('um.detail.noLogin') },
        { icon: KeyRound, label: t('um.col.lastPasswordChange'), value: user.last_password_change ? formatDate(user.last_password_change, { dateStyle: 'medium' }) : '—' },
        { icon: AlertCircle, label: t('um.col.failedAttempts'), value: String(user.failed_login_attempts) },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Back Button */}
      <button
        onClick={() => router.push('/user-management/users')}
        className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> {t('um.detail.back')}
      </button>

      {/* Profile Header */}
      <Card className="p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white text-[24px] font-bold">{getInitials(user.full_name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-bold text-main">{user.full_name}</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">{user.position || '—'} · {user.department?.name || '—'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusStyles[user.account_status]}`}>
                {t(`um.status.${user.account_status}`)}
              </span>
              <span className="text-[11px] text-muted-foreground">@{user.username}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => router.push(`/user-management/users/${user.id}?edit=true`)}>
              <Pencil size={14} className="mr-1.5" /> {t('um.detail.editUser')}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={handleResetPassword}>
              <KeyRound size={14} className="mr-1.5" /> {t('um.actions.resetPassword')}
            </Button>
            {user.account_status === 'locked' ? (
              <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => handleLockUnlock('locked')}>
                <Unlock size={14} className="mr-1.5" /> {t('um.actions.unlock')}
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => handleLockUnlock('active')}>
                <Lock size={14} className="mr-1.5" /> {t('um.actions.lock')}
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => handleToggleStatus(user.account_status)}>
              <Power size={14} className="mr-1.5" /> {user.account_status === 'active' ? t('um.actions.disable') : t('um.actions.enable')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {infoSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
          >
            <Card className="p-5 border-surface card-shadow" style={{ borderRadius: '18px' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-accent/50 flex items-center justify-center">
                  <section.icon size={16} className="text-primary" />
                </div>
                <h3 className="text-[14px] font-bold text-main">{section.title}</h3>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface last:border-0">
                    <span className="text-[12px] text-muted-foreground flex items-center gap-2">
                      <item.icon size={13} className="text-muted-foreground/60" />
                      {item.label}
                    </span>
                    <span className="text-[12px] font-semibold text-main text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security Actions */}
      <Card className="p-5 border-surface card-shadow" style={{ borderRadius: '18px' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-accent/50 flex items-center justify-center">
            <Shield size={16} className="text-primary" />
          </div>
          <h3 className="text-[14px] font-bold text-main">{t('um.detail.security')}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={handleResetPassword}>
            <KeyRound size={14} className="mr-1.5" /> {t('um.actions.resetPassword')}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-[12px]">
            <Send size={14} className="mr-1.5" /> {t('um.actions.sendResetEmail')}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-[12px]">
            <Send size={14} className="mr-1.5" /> {t('um.actions.resendWelcome')}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => router.push(`/user-management/activity-logs?user=${user.id}`)}>
            <Clock size={14} className="mr-1.5" /> {t('um.actions.viewActivityLogs')}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => router.push(`/user-management/login-history?user=${user.id}`)}>
            <Clock size={14} className="mr-1.5" /> {t('um.actions.viewLoginHistory')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const nums = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + nums + special;
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 6; i++) pwd += all[Math.floor(Math.random() * all.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}
