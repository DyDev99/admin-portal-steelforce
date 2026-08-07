'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Power,
  KeyRound,
  Download,
  CheckSquare,
  Square,
  Eye,
  Pencil,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { getSupabaseClient } from '@/lib/supabase';
import type { AppUserWithRelations, Department, Role } from '@/lib/types';
import { UserManagementNav } from '@/components/user-management/user-management-nav';

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  disabled: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  locked: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
};

export default function UsersPage() {
  const { t, formatDate } = useI18n();
  const router = useRouter();
  const [users, setUsers] = useState<AppUserWithRelations[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('app_users')
      .select('*, department:departments(*), role:roles(*)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    setUsers((data || []) as AppUserWithRelations[]);

    const { data: depts } = await supabase.from('departments').select('*');
    setDepartments((depts || []) as Department[]);

    const { data: rls } = await supabase.from('roles').select('*');
    setRoles((rls || []) as Role[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = users.filter((u) => {
    const matchStatus = statusFilter === 'all' || u.account_status === statusFilter;
    const matchSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.employee_id || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setShowBulkBar(next.size > 0);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
      setShowBulkBar(false);
    } else {
      setSelected(new Set(paginated.map((u) => u.id)));
      setShowBulkBar(true);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('app_users').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    setShowDeleteConfirm(null);
    fetchData();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    await supabase
      .from('app_users')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', Array.from(selected));
    setSelected(new Set());
    setShowBulkBar(false);
    fetchData();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await supabase.from('app_users').update({ account_status: newStatus }).eq('id', id);
    fetchData();
  };

  const handleResetPassword = async (id: string) => {
    const tempPwd = generatePassword();
    await supabase.from('app_users').update({
      temp_password: tempPwd,
      force_password_reset: true,
      last_password_change: new Date().toISOString(),
    }).eq('id', id);
    fetchData();
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const statusFilters = [
    { key: 'all', labelKey: 'filter.all' },
    { key: 'active', labelKey: 'um.status.active' },
    { key: 'disabled', labelKey: 'um.status.disabled' },
    { key: 'locked', labelKey: 'um.status.locked' },
  ];

  return (
    <div className="space-y-5">
      <UserManagementNav />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('um.users.totalUsers'), value: users.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: t('um.users.activeUsers'), value: users.filter((u) => u.account_status === 'active').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: t('um.users.disabledUsers'), value: users.filter((u) => u.account_status === 'disabled').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
          { label: t('um.users.lockedUsers'), value: users.filter((u) => u.account_status === 'locked').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 border-surface card-shadow" style={{ borderRadius: '16px' }}>
              <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
              <p className={`text-[24px] font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {showBulkBar && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-accent/30 border border-surface"
          >
            <span className="text-[13px] font-semibold text-main">
              {selected.size} {t('um.users.selected')}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={handleBulkDelete}>
                <Trash2 size={14} className="mr-1.5" /> {t('um.bulk.delete')}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => { selected.forEach((id) => handleToggleStatus(id, 'disabled')); setSelected(new Set()); setShowBulkBar(false); }}>
                <Power size={14} className="mr-1.5" /> {t('um.bulk.disable')}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl text-[12px]" onClick={() => { selected.forEach((id) => handleResetPassword(id)); setSelected(new Set()); setShowBulkBar(false); }}>
                <KeyRound size={14} className="mr-1.5" /> {t('um.bulk.resetPassword')}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl text-[12px]">
                <Download size={14} className="mr-1.5" /> {t('um.bulk.export')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Bar */}
      <Card className="p-4 border-surface card-shadow" style={{ borderRadius: '18px' }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('um.users.search')}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-background/50 border border-surface text-[13px] text-main placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
                  statusFilter === f.key ? 'gradient-primary text-white shadow-md shadow-blue-200/50' : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" className="rounded-xl text-[12px]">
              <Download size={14} className="mr-1.5" /> {t('um.users.export')}
            </Button>
            <Button size="sm" className="rounded-xl gradient-primary text-white border-0" onClick={() => router.push('/user-management/users/new')}>
              <Plus size={15} className="mr-1.5" /> {t('um.users.addUser')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="border-surface card-shadow overflow-hidden" style={{ borderRadius: '18px' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-primary transition-colors">
                    {selected.size === paginated.length && paginated.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{t('um.col.fullName')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">{t('um.col.employeeId')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">{t('um.col.department')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden xl:table-cell">{t('um.col.role')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{t('um.col.status')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">{t('um.col.lastLogin')}</th>
                <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{t('um.col.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-surface">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-10 rounded-xl bg-muted/30 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-[13px]">
                    {t('um.users.noResults')}
                  </td>
                </tr>
              ) : (
                paginated.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-t border-surface hover:bg-accent/20 transition-colors duration-150 ${selected.has(user.id) ? 'bg-accent/30' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(user.id)} className="text-muted-foreground hover:text-primary transition-colors">
                        {selected.has(user.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[11px] font-bold">{getInitials(user.full_name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-main truncate">{user.full_name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[12px] text-muted-foreground font-mono">{user.employee_id || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[12px] text-muted-foreground">{user.department?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-[12px] text-muted-foreground">{user.role?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusStyles[user.account_status] || statusStyles.active}`}>
                        {t(`um.status.${user.account_status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[12px] text-muted-foreground">
                        {user.last_login ? formatDate(user.last_login, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('um.detail.noLogin')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => router.push(`/user-management/users/${user.id}`)}
                          className="w-8 h-8 rounded-lg hover:bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                          title={t('um.actions.view')}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => router.push(`/user-management/users/${user.id}?edit=true`)}
                          className="w-8 h-8 rounded-lg hover:bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                          title={t('um.actions.edit')}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.account_status)}
                          className="w-8 h-8 rounded-lg hover:bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-amber-500 transition-colors"
                          title={user.account_status === 'active' ? t('um.actions.disable') : t('um.actions.enable')}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="w-8 h-8 rounded-lg hover:bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                          title={t('um.actions.delete')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-surface">
            <p className="text-[11px] text-muted-foreground">
              {t('table.showing')} <span className="font-semibold text-main">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)}</span> {t('table.of')} <span className="font-semibold text-main">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-surface flex items-center justify-center text-muted-foreground hover:bg-accent/50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-all ${page === i + 1 ? 'gradient-primary text-white' : 'text-muted-foreground hover:bg-accent/50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-surface flex items-center justify-center text-muted-foreground hover:bg-accent/50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass rounded-2xl card-shadow p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-main">{t('um.delete.title')}</h3>
                  <p className="text-[12px] text-muted-foreground mt-1">{t('um.delete.message')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Button variant="outline" className="rounded-xl flex-1" onClick={() => setShowDeleteConfirm(null)}>
                  {t('um.delete.cancel')}
                </Button>
                <Button className="rounded-xl flex-1 bg-red-500 hover:bg-red-600 text-white border-0" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>
                  {t('um.delete.confirm')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
