'use client';

import { PageBody, PageToolbar, ToolbarRow } from '@/components/shared/page-layout';
import { PageHeader, ActionButton } from '@/components/shared/page-header';
import { SearchBar } from '@/components/shared/search-bar';
import { FilterChip, ToggleChip } from '@/components/shared/filter-chip';
import { MetaPill, StatusPill, type Tone } from '@/components/shared/status-pill';
import { Modal } from '@/components/shared/feedback';
import { SelectField, TextArea, TextField, ToggleField } from '@/components/shared/form';
import { EmptyState } from '@/components/shared/section-header';
import { RepAvatar } from '@/components/planning/rep-avatar';
import { repById } from '@/lib/data/crm';
import {
  ACTIVITY_PRIORITIES,
  ACTIVITY_TYPES,
  TODAY_ISO,
  activities as seedActivities,
  activityBucket,
  repOptions,
  type Activity,
  type ActivityStatus,
  type ActivityType,
} from '@/lib/data/field';
import { formatDate, relativeDays } from '@/lib/data/seed';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Flag,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const EASE = [0.22, 1, 0.36, 1] as const;

const TYPE_ICON: Record<ActivityType, typeof Phone> = {
  Call: Phone,
  Visit: MapPin,
  Meeting: Users,
  'Follow-up': CalendarClock,
  Quotation: FileText,
  Task: ClipboardList,
  Email: Mail,
};

const STATUS_TONE: Record<ActivityStatus, Tone> = {
  Planned: 'info',
  'In Progress': 'warning',
  Completed: 'positive',
  Overdue: 'critical',
};

const PRIORITY_TONE: Record<string, Tone> = {
  High: 'critical',
  Medium: 'warning',
  Low: 'neutral',
};

const VIEWS = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All' },
] as const;

type View = (typeof VIEWS)[number]['id'];

const opts = (v: readonly string[]) => v.map((x) => ({ value: x, label: x }));

/**
 * Activity timeline.
 *
 * Grouped by date rather than paged in a table: a rep's question is "what is
 * next", which a chronological list answers directly and a sortable grid does
 * not. Views slice by urgency, not by entity.
 */
export default function DailyActivitiesPage() {
  const [items, setItems] = useState<Activity[]>(() => seedActivities.map((a) => ({ ...a })));
  const [view, setView] = useState<View>('today');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [rep, setRep] = useState('All');
  const [priority, setPriority] = useState('All');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    type: 'Call',
    customer: '',
    date: TODAY_ISO,
    time: '09:00',
    priority: 'Medium',
    description: '',
    repId: '',
    reminder: true,
  });

  const counts = useMemo(() => {
    const base = { today: 0, upcoming: 0, overdue: 0, completed: 0, all: items.length };
    items.forEach((a) => {
      base[activityBucket(a)] += 1;
    });
    return base;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((a) => {
        if (view !== 'all' && activityBucket(a) !== view) return false;
        if (type !== 'All' && a.type !== type) return false;
        if (rep !== 'All' && a.repId !== rep) return false;
        if (priority !== 'All' && a.priority !== priority) return false;
        if (q && !`${a.title} ${a.customerName} ${a.description}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [items, view, search, type, rep, priority]);

  /** Grouped by day so the timeline has date anchors rather than 40 flat rows. */
  const grouped = useMemo(() => {
    const map = new Map<string, Activity[]>();
    filtered.forEach((a) => {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const activeFilters =
    [type, rep, priority].filter((v) => v !== 'All').length + (search.trim() ? 1 : 0);

  const complete = (activity: Activity) => {
    setItems((prev) =>
      prev.map((a) => (a.id === activity.id ? { ...a, status: 'Completed' } : a))
    );
    toast.success('Activity completed', { description: activity.title });
  };

  return (
    <PageBody>
      <PageHeader
        title="Daily Activities"
        subtitle="Everything you need to do today, and what is coming next."
        actions={
          <ActionButton icon={Plus} tone="primary" onClick={() => setCreating(true)}>
            New Activity
          </ActionButton>
        }
      />

      <PageToolbar>
        <ToolbarRow>
          <SearchBar value={search} onChange={setSearch} placeholder="Search activity or customer…" className="w-full sm:w-[280px]" />
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 overflow-x-auto scrollbar-hide">
            {VIEWS.map((v) => (
              <ToggleChip
                key={v.id}
                label={v.label}
                count={counts[v.id]}
                active={view === v.id}
                onClick={() => setView(v.id)}
              />
            ))}
          </div>
          <FilterChip label="Type" icon={ClipboardList} value={type} options={opts(ACTIVITY_TYPES)} onChange={setType} allLabel="All types" />
          <FilterChip label="Assigned to" icon={UserCheck} value={rep} options={repOptions()} onChange={setRep} allLabel="Everyone" searchable />
          <FilterChip label="Priority" icon={Flag} value={priority} options={opts(ACTIVITY_PRIORITIES)} onChange={setPriority} allLabel="Any priority" />
          {activeFilters > 0 && (
            <ActionButton
              icon={RotateCcw}
              onClick={() => {
                setSearch('');
                setType('All');
                setRep('All');
                setPriority('All');
              }}
            >
              Clear ({activeFilters})
            </ActionButton>
          )}
        </ToolbarRow>
      </PageToolbar>

      {counts.overdue > 0 && view !== 'overdue' && (
        <button
          onClick={() => setView('overdue')}
          className="w-full flex items-center gap-2.5 p-3 rounded-card bg-rose-500/10 border border-rose-500/20 text-left hover:bg-rose-500/15 transition-colors"
        >
          <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="text-[12.5px] text-rose-700 dark:text-rose-400">
            <span className="font-semibold">{counts.overdue} activities are overdue.</span> Review
            them before planning tomorrow.
          </span>
        </button>
      )}

      {grouped.length === 0 ? (
        <div className="rounded-card border border-surface bg-card">
          <EmptyState
            icon={CheckCircle2}
            title={view === 'today' ? 'Nothing scheduled today' : 'No activities match'}
            hint={
              view === 'today'
                ? 'Your day is clear. Check Upcoming to plan ahead.'
                : 'Try a different view or clear the filters.'
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayItems]) => {
            const rel = relativeDays(date);
            const isOverdue = date < TODAY_ISO;
            return (
              <section key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-[13px] font-bold text-main">{formatDate(date)}</h2>
                  <StatusPill
                    size="sm"
                    label={rel?.label ?? ''}
                    tone={isOverdue ? 'critical' : rel?.days === 0 ? 'warning' : 'neutral'}
                  />
                  <span className="h-px flex-1 bg-border" />
                  <MetaPill label={`${dayItems.length} activities`} />
                </div>

                <ol className="relative space-y-2.5">
                  {dayItems.map((activity, i) => {
                    const Icon = TYPE_ICON[activity.type];
                    const owner = repById(activity.repId);
                    return (
                      <motion.li
                        key={activity.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.28, ease: EASE }}
                        className={`rounded-card border p-4 transition-colors ${
                          activity.status === 'Completed'
                            ? 'border-surface bg-muted/20'
                            : activity.status === 'Overdue'
                              ? 'border-rose-500/25 bg-rose-500/5'
                              : 'border-surface bg-card'
                        }`}
                      >
                        <div className="flex flex-wrap items-start gap-3.5">
                          <span className="flex flex-col items-center flex-shrink-0 w-12">
                            <span className="text-[12.5px] font-bold text-main tabular-nums">
                              {activity.time}
                            </span>
                            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mt-1.5">
                              <Icon size={14} className="text-primary" />
                            </span>
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className={`text-[13px] font-semibold truncate ${
                                  activity.status === 'Completed'
                                    ? 'text-muted-foreground line-through'
                                    : 'text-main'
                                }`}
                              >
                                {activity.title}
                              </p>
                              <StatusPill size="sm" label={activity.status} tone={STATUS_TONE[activity.status]} />
                              <StatusPill size="sm" label={activity.priority} tone={PRIORITY_TONE[activity.priority]} />
                              <MetaPill label={activity.type} />
                            </div>
                            <p className="text-[11.5px] text-muted-foreground mt-1">
                              {activity.customerName}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                              {activity.description}
                            </p>
                            {activity.status !== 'Completed' && (
                              <p className="text-[10.5px] text-muted-foreground mt-1.5">
                                <span className="font-semibold text-main">Next:</span>{' '}
                                {activity.nextAction}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {owner && <RepAvatar rep={owner} size="sm" showStatus={false} />}
                            {activity.status !== 'Completed' && (
                              <ActionButton icon={CheckCircle2} onClick={() => complete(activity)}>
                                Complete
                              </ActionButton>
                            )}
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New activity"
        subtitle="Log a call, plan a visit or raise a task."
        icon={Target}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setCreating(false)}>Cancel</ActionButton>
            <ActionButton
              tone="primary"
              icon={Plus}
              onClick={() => {
                if (!draft.customer.trim()) {
                  toast.error('A customer is required');
                  return;
                }
                const created: Activity = {
                  id: `ACT-${String(items.length + 1).padStart(3, '0')}`,
                  type: draft.type as ActivityType,
                  customerId: 'CUS-000',
                  customerName: draft.customer,
                  title: draft.description.slice(0, 48) || `${draft.type} with ${draft.customer}`,
                  description: draft.description || `${draft.type} scheduled with ${draft.customer}.`,
                  date: draft.date,
                  time: draft.time,
                  repId: draft.repId || repOptions()[0].value,
                  priority: draft.priority,
                  status: draft.date < TODAY_ISO ? 'Overdue' : 'Planned',
                  nextAction: 'Log the outcome and set the next follow-up',
                };
                setItems((prev) => [created, ...prev]);
                setCreating(false);
                toast.success('Activity created', { description: created.title });
              }}
            >
              Create activity
            </ActionButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Activity type" required value={draft.type} onChange={(v) => setDraft((p) => ({ ...p, type: v }))} options={ACTIVITY_TYPES} />
          <SelectField label="Priority" value={draft.priority} onChange={(v) => setDraft((p) => ({ ...p, priority: v }))} options={ACTIVITY_PRIORITIES} />
          <TextField label="Customer" required value={draft.customer} onChange={(v) => setDraft((p) => ({ ...p, customer: v }))} placeholder="Angkor Steel Trading" full />
          <TextField label="Date" type="date" value={draft.date} onChange={(v) => setDraft((p) => ({ ...p, date: v }))} />
          <TextField label="Time" type="time" value={draft.time} onChange={(v) => setDraft((p) => ({ ...p, time: v }))} />
          <SelectField label="Assigned to" value={draft.repId} onChange={(v) => setDraft((p) => ({ ...p, repId: v }))} options={repOptions()} full />
          <TextArea label="Description" value={draft.description} onChange={(v) => setDraft((p) => ({ ...p, description: v }))} rows={3} placeholder="Follow up on the roofing quotation sent last week." />
          <div className="sm:col-span-2">
            <ToggleField
              label="Set a reminder"
              description="Notify the assigned rep 30 minutes before this activity."
              checked={draft.reminder}
              onChange={(v) => setDraft((p) => ({ ...p, reminder: v }))}
            />
          </div>
        </div>
      </Modal>
    </PageBody>
  );
}
