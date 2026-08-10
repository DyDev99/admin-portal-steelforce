'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Building2,
  Shield,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { createUser, fetchDepartments, fetchRoles } from '@/lib/mock-store';
import type { Department, Role } from '@/lib/types';

const steps = [
  { key: 'general', labelKey: 'um.create.step.general', icon: User },
  { key: 'company', labelKey: 'um.create.step.company', icon: Building2 },
  { key: 'security', labelKey: 'um.create.step.security', icon: Shield },
  { key: 'avatar', labelKey: 'um.create.step.avatar', icon: Camera },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    gender: 'Male',
    birthday: '',
    address: '',
    department_id: '',
    position: '',
    role_id: '',
    manager_name: '',
    join_date: '',
    temp_password: '',
    force_password_reset: true,
    send_welcome_email: true,
    employment_status: 'Active',
    account_status: 'active',
  });

  useEffect(() => {
    const loadOptions = async () => {
      const [depts, rls] = await Promise.all([fetchDepartments(), fetchRoles()]);
      setDepartments(depts);
      setRoles(rls);
    };
    loadOptions();
  }, []);

  const updateForm = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generatePassword = () => {
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
    const generated = pwd.split('').sort(() => Math.random() - 0.5).join('');
    updateForm('temp_password', generated);
  };

  const passwordStrength = (pwd: string): { score: number; label: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const labels = [t('um.create.passwordWeak'), t('um.create.passwordWeak'), t('um.create.passwordFair'), t('um.create.passwordGood'), t('um.create.passwordStrong'), t('um.create.passwordStrong')];
    return { score, label: labels[score] };
  };

  const strength = passwordStrength(form.temp_password);
  const strengthColors = ['bg-muted', 'bg-red-400', 'bg-amber-400', 'bg-sky-400', 'bg-green-400', 'bg-green-500'];

  const canProceed = () => {
    if (step === 0) return form.full_name.trim() && form.username.trim() && form.email.trim();
    if (step === 1) return form.department_id && form.role_id;
    if (step === 2) return form.temp_password.length >= 8;
    return true;
  };

  const handleCreate = async () => {
    setSaving(true);
    await createUser({
      full_name: form.full_name,
      username: form.username,
      email: form.email,
      phone: form.phone,
      gender: form.gender,
      birthday: form.birthday || null,
      address: form.address,
      department_id: form.department_id || null,
      position: form.position,
      role_id: form.role_id || null,
      manager_name: form.manager_name,
      join_date: form.join_date || null,
      temp_password: form.temp_password,
      force_password_reset: form.force_password_reset,
      employment_status: form.employment_status,
      account_status: form.account_status,
    });
    setSaving(false);

    toast.success(t('validation.saved'));
    router.push('/user-management/users');
  };

  const inputClass = "w-full h-11 px-4 rounded-xl bg-background/50 border border-surface text-[13px] text-main placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all";
  const labelClass = "text-[12px] font-medium text-muted-foreground mb-1.5 block";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button
        onClick={() => router.push('/user-management/users')}
        className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> {t('um.detail.back')}
      </button>

      <Card className="p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
        <h2 className="text-[18px] font-bold text-main mb-1">{t('um.create.title')}</h2>
        <p className="text-[12px] text-muted-foreground mb-6">{t('um.subtitle')}</p>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    i === step
                      ? 'gradient-primary text-white shadow-md shadow-blue-200/50'
                      : i < step
                      ? 'bg-green-500 text-white'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {i < step ? <Check size={18} /> : <s.icon size={18} />}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t(s.labelKey)}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${i < step ? 'bg-green-500' : 'bg-muted/50'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content — enter-only animation; see the note in app-shell.tsx
            for why `AnimatePresence mode="wait"` is avoided here. */}
        <div key={step}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('um.create.fullName')}</label>
                  <input className={inputClass} value={form.full_name} onChange={(e) => updateForm('full_name', e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.username')}</label>
                  <input className={inputClass} value={form.username} onChange={(e) => updateForm('username', e.target.value)} placeholder="john.doe" />
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.email')}</label>
                  <input type="email" className={inputClass} value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="john.doe@steelforce.com" />
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.phone')}</label>
                  <input className={inputClass} value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+98 912 345 6789" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{t('um.create.gender')}</label>
                    <select className={inputClass} value={form.gender} onChange={(e) => updateForm('gender', e.target.value)}>
                      <option value="Male">{t('um.create.male')}</option>
                      <option value="Female">{t('um.create.female')}</option>
                      <option value="Other">{t('um.create.other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('um.create.birthday')}</label>
                    <input type="date" className={inputClass} value={form.birthday} onChange={(e) => updateForm('birthday', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.address')}</label>
                  <input className={inputClass} value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Tehran, Iran" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('um.create.department')}</label>
                  <select className={inputClass} value={form.department_id} onChange={(e) => updateForm('department_id', e.target.value)}>
                    <option value="">—</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.position')}</label>
                  <input className={inputClass} value={form.position} onChange={(e) => updateForm('position', e.target.value)} placeholder="Sales Representative" />
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.role')}</label>
                  <select className={inputClass} value={form.role_id} onChange={(e) => updateForm('role_id', e.target.value)}>
                    <option value="">—</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.manager')}</label>
                  <input className={inputClass} value={form.manager_name} onChange={(e) => updateForm('manager_name', e.target.value)} placeholder="Ahmad Reza" />
                </div>
                <div>
                  <label className={labelClass}>{t('um.create.joinDate')}</label>
                  <input type="date" className={inputClass} value={form.join_date} onChange={(e) => updateForm('join_date', e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('um.create.tempPassword')}</label>
                  <div className="flex gap-2">
                    <input className={inputClass} value={form.temp_password} onChange={(e) => updateForm('temp_password', e.target.value)} placeholder="••••••••" />
                    <Button variant="outline" className="rounded-xl px-4" onClick={generatePassword}>
                      <RefreshCw size={15} />
                    </Button>
                  </div>
                </div>
                {form.temp_password && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-muted-foreground">{t('um.create.passwordStrength')}</span>
                      <span className={`text-[11px] font-semibold ${strength.score >= 4 ? 'text-green-600' : strength.score >= 3 ? 'text-sky-600' : 'text-amber-600'}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < strength.score ? strengthColors[strength.score] : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground bg-accent/30 rounded-xl p-3">{t('um.create.passwordPolicy')}</p>
                <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 cursor-pointer transition-colors">
                  <input type="checkbox" checked={form.force_password_reset} onChange={(e) => updateForm('force_password_reset', e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-[12px] text-main">{t('um.create.requirePasswordChange')}</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 cursor-pointer transition-colors">
                  <input type="checkbox" checked={form.send_welcome_email} onChange={(e) => updateForm('send_welcome_email', e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-[12px] text-main">{t('um.create.sendWelcomeEmail')}</span>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-24 h-24 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                    <Camera size={32} className="text-muted-foreground" />
                  </div>
                  <Button variant="outline" className="rounded-xl">{t('um.actions.uploadAvatar')}</Button>
                </div>
                <div className="bg-accent/30 rounded-xl p-4 space-y-2">
                  <p className="text-[12px] font-semibold text-main">{t('um.create.fullName')}: {form.full_name}</p>
                  <p className="text-[12px] text-muted-foreground">{t('um.create.username')}: {form.username}</p>
                  <p className="text-[12px] text-muted-foreground">{t('um.create.email')}: {form.email}</p>
                  <p className="text-[12px] text-muted-foreground">{t('um.create.role')}: {roles.find((r) => r.id === form.role_id)?.name || '—'}</p>
                  <p className="text-[12px] text-muted-foreground">{t('um.create.department')}: {departments.find((d) => d.id === form.department_id)?.name || '—'}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft size={16} className="mr-1.5" /> {t('um.create.previous')}
          </Button>
          {step < steps.length - 1 ? (
            <Button
              className="rounded-xl gradient-primary text-white border-0"
              disabled={!canProceed()}
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              {t('um.create.next')} <ArrowRight size={16} className="ml-1.5" />
            </Button>
          ) : (
            <Button
              className="rounded-xl gradient-primary text-white border-0"
              disabled={saving}
              onClick={handleCreate}
            >
              {saving ? '...' : t('um.create.create')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
