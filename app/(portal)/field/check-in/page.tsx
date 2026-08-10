'use client';

import { PageBody } from '@/components/shared/page-layout';
import { PageHeader, ActionButton } from '@/components/shared/page-header';
import { MetaPill, ProgressBar, StatusPill, type Tone } from '@/components/shared/status-pill';
import { Modal } from '@/components/shared/feedback';
import { SelectField, TextArea } from '@/components/shared/form';
import { EmptyState } from '@/components/shared/section-header';
import { CURRENT_LOCATION, todaysVisits, type FieldVisit, type VisitStatus } from '@/lib/data/field';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  LogIn,
  LogOut,
  MapPin,
  Navigation,
  Package,
  Satellite,
  Target,
  Timer,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const EASE = [0.22, 1, 0.36, 1] as const;

const VISIT_TONE: Record<VisitStatus, Tone> = {
  Scheduled: 'neutral',
  'In Progress': 'warning',
  Completed: 'positive',
  Missed: 'critical',
};

/**
 * Field check-in.
 *
 * An operational tool, not a dashboard: location and the next action dominate,
 * the day is a queue, and check-in confirms *where you are* before starting a
 * visit — that confirmation is the entire point of a GPS-verified check-in.
 */
export default function CheckInPage() {
  const [visits, setVisits] = useState<FieldVisit[]>(() => todaysVisits.map((v) => ({ ...v })));
  const [confirming, setConfirming] = useState<FieldVisit | null>(null);
  const [completing, setCompleting] = useState<FieldVisit | null>(null);
  const [outcome, setOutcome] = useState({ notes: '', feedback: 'Positive', nextAction: 'Schedule follow-up' });
  const [clock, setClock] = useState('');

  // The clock starts only after mount — rendering a live time on the server
  // would disagree with the client at hydration.
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const completed = visits.filter((v) => v.status === 'Completed').length;
    const remaining = visits.filter((v) => v.status === 'Scheduled').length;
    const active = visits.find((v) => v.status === 'In Progress') ?? null;
    return { completed, remaining, active, total: visits.length };
  }, [visits]);

  const checkIn = (visit: FieldVisit) => {
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setVisits((prev) =>
      prev.map((v) => (v.id === visit.id ? { ...v, status: 'In Progress', checkInAt: now } : v))
    );
    setConfirming(null);
    toast.success('Checked in', { description: `${visit.customerName} at ${now}` });
  };

  const checkOut = (visit: FieldVisit) => {
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visit.id
          ? { ...v, status: 'Completed', checkOutAt: now, durationMinutes: v.durationMinutes ?? 38 }
          : v
      )
    );
    setCompleting(null);
    setOutcome({ notes: '', feedback: 'Positive', nextAction: 'Schedule follow-up' });
    toast.success('Visit completed', { description: `${visit.customerName} · logged at ${now}` });
  };

  return (
    <PageBody>
      <PageHeader
        title="Field Check-in"
        subtitle="Start and complete customer visits. Your location is verified at check-in."
        actions={
          <ActionButton
            icon={Navigation}
            onClick={() => toast.success('Location refreshed', { description: CURRENT_LOCATION.label })}
          >
            Refresh location
          </ActionButton>
        }
      />

      {/* Location first — it gates everything else on this page */}
      <section className="rounded-card border border-surface bg-card p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Satellite size={19} className="text-emerald-600 dark:text-emerald-400" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-bold text-main">Current location</p>
                <StatusPill label="GPS locked" tone="positive" icon={CheckCircle2} />
                <MetaPill label={`±${CURRENT_LOCATION.accuracyMetres} m accuracy`} />
              </div>
              <p className="text-[12px] text-muted-foreground mt-1 truncate">{CURRENT_LOCATION.label}</p>
              <p className="text-[10.5px] text-muted-foreground font-mono mt-0.5">
                {CURRENT_LOCATION.lat.toFixed(4)}, {CURRENT_LOCATION.lng.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Stat icon={Clock} label="Time" value={clock || '—'} />
            <Stat icon={Target} label="Visits" value={String(stats.total)} />
            <Stat icon={CheckCircle2} label="Done" value={String(stats.completed)} tone="positive" />
            <Stat icon={Timer} label="Left" value={String(stats.remaining)} tone="warning" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Day progress</span>
            <span className="tabular-nums font-semibold text-main">
              {stats.completed} of {stats.total} complete
            </span>
          </div>
          <ProgressBar value={(stats.completed / Math.max(1, stats.total)) * 100} tone="positive" />
        </div>
      </section>

      {/* The one visit in progress gets its own surface */}
      <AnimatePresence>
        {stats.active && (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="rounded-card border border-amber-500/30 bg-amber-500/5 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Timer size={19} className="text-amber-600 dark:text-amber-400" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-bold text-main truncate">
                      {stats.active.customerName}
                    </p>
                    <StatusPill label="Visit in progress" tone="warning" />
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    Checked in at {stats.active.checkInAt} · {stats.active.type}
                  </p>
                  <p className="text-[11.5px] text-main mt-1.5">{stats.active.purpose}</p>
                </div>
              </div>
              <ActionButton icon={LogOut} tone="primary" onClick={() => setCompleting(stats.active)}>
                Complete visit
              </ActionButton>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section>
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <h2 className="text-[14px] font-bold text-main">Today&apos;s visits</h2>
          <MetaPill label="Ordered by scheduled time" />
        </div>

        {visits.length === 0 ? (
          <div className="rounded-card border border-surface bg-card">
            <EmptyState icon={MapPin} title="No visits planned today" hint="Stops assigned in Planning appear here." />
          </div>
        ) : (
          <ul className="space-y-2.5">
            {visits.map((visit, i) => (
              <motion.li
                key={visit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.04, duration: 0.3, ease: EASE }}
                className={`rounded-card border p-4 transition-colors ${
                  visit.status === 'In Progress'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-surface bg-card'
                }`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex flex-col items-center flex-shrink-0 w-14">
                    <span className="text-[14px] font-bold text-main tabular-nums">{visit.scheduledAt}</span>
                    <span className="text-[9.5px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      Planned
                    </span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold text-main truncate">{visit.customerName}</p>
                      <StatusPill label={visit.status} tone={VISIT_TONE[visit.status]} />
                      <MetaPill label={visit.type} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">{visit.address}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10.5px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Navigation size={11} /> {visit.distanceKm} km away
                      </span>
                      {visit.checkInAt && (
                        <span className="inline-flex items-center gap-1">
                          <LogIn size={11} /> In {visit.checkInAt}
                        </span>
                      )}
                      {visit.checkOutAt && (
                        <span className="inline-flex items-center gap-1">
                          <LogOut size={11} /> Out {visit.checkOutAt}
                        </span>
                      )}
                      {visit.durationMinutes && (
                        <span className="inline-flex items-center gap-1">
                          <Timer size={11} /> {visit.durationMinutes} min on site
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {visit.status === 'Scheduled' && (
                      <ActionButton icon={LogIn} tone="primary" onClick={() => setConfirming(visit)}>
                        Check in
                      </ActionButton>
                    )}
                    {visit.status === 'In Progress' && (
                      <ActionButton icon={LogOut} tone="primary" onClick={() => setCompleting(visit)}>
                        Check out
                      </ActionButton>
                    )}
                    {visit.status === 'Completed' && (
                      <ActionButton icon={FileText} onClick={() => toast.info('Visit report', { description: visit.customerName })}>
                        View report
                      </ActionButton>
                    )}
                    {visit.status === 'Missed' && (
                      <ActionButton icon={Clock} onClick={() => toast.success('Visit rescheduled', { description: visit.customerName })}>
                        Reschedule
                      </ActionButton>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title="Confirm check-in"
        subtitle={confirming?.customerName}
        icon={LogIn}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setConfirming(null)}>Cancel</ActionButton>
            <ActionButton icon={CheckCircle2} tone="primary" onClick={() => confirming && checkIn(confirming)}>
              Check in now
            </ActionButton>
          </div>
        }
      >
        {confirming && (
          <>
            <div className="rounded-card border border-surface p-3.5 space-y-2.5">
              <Row icon={MapPin} label="Customer" value={confirming.customerName} />
              <Row icon={Navigation} label="Distance from you" value={`${confirming.distanceKm} km`} />
              <Row icon={Satellite} label="GPS accuracy" value={`±${CURRENT_LOCATION.accuracyMetres} m`} />
              <Row icon={Clock} label="Scheduled" value={confirming.scheduledAt} />
              <Row icon={Target} label="Visit type" value={confirming.type} />
            </div>

            <div className="rounded-card border border-surface p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                Visit purpose
              </p>
              <p className="text-[12px] text-main leading-relaxed">{confirming.purpose}</p>
            </div>

            {confirming.distanceKm > 1 && (
              <div className="flex items-start gap-2.5 p-3 rounded-card bg-amber-500/10 border border-amber-500/20">
                <Target size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11.5px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  You are {confirming.distanceKm} km away, outside the 1 km check-in radius. This
                  check-in will be flagged for review.
                </p>
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={completing !== null}
        onClose={() => setCompleting(null)}
        title="Complete visit"
        subtitle={completing?.customerName}
        icon={LogOut}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <ActionButton icon={Target} onClick={() => toast.success('Opportunity created', { description: completing?.customerName })}>
              Create opportunity
            </ActionButton>
            <ActionButton icon={FileText} onClick={() => toast.success('Quotation drafted', { description: completing?.customerName })}>
              Create quotation
            </ActionButton>
            <ActionButton icon={CheckCircle2} tone="primary" onClick={() => completing && checkOut(completing)}>
              Complete visit
            </ActionButton>
          </div>
        }
      >
        {completing && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Stat icon={LogIn} label="Checked in" value={completing.checkInAt ?? '—'} />
              <Stat icon={Clock} label="Now" value={clock.slice(0, 5) || '—'} />
              <Stat icon={Timer} label="Duration" value={`${completing.durationMinutes ?? 38} min`} />
            </div>

            <TextArea
              label="Visit notes"
              value={outcome.notes}
              onChange={(v) => setOutcome((p) => ({ ...p, notes: v }))}
              rows={3}
              placeholder="Stock levels checked. Owner asked about the new colour-coated roofing range."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Customer feedback"
                value={outcome.feedback}
                onChange={(v) => setOutcome((p) => ({ ...p, feedback: v }))}
                options={['Positive', 'Neutral', 'Concern raised', 'Complaint']}
              />
              <SelectField
                label="Next action"
                value={outcome.nextAction}
                onChange={(v) => setOutcome((p) => ({ ...p, nextAction: v }))}
                options={['Schedule follow-up', 'Send quotation', 'No action needed', 'Escalate to manager']}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toast.info('Camera', { description: 'Capture shelf and site photos.' })}
                className="rounded-card border border-dashed border-surface p-4 text-center hover:border-primary/40 hover:bg-accent/30 transition-colors"
              >
                <Camera size={17} className="text-muted-foreground mx-auto mb-1.5" />
                <p className="text-[11.5px] font-medium text-main">Add photos</p>
              </button>
              <button
                onClick={() => toast.info('Products', { description: 'Log the products discussed on this visit.' })}
                className="rounded-card border border-dashed border-surface p-4 text-center hover:border-primary/40 hover:bg-accent/30 transition-colors"
              >
                <Package size={17} className="text-muted-foreground mx-auto mb-1.5" />
                <p className="text-[11.5px] font-medium text-main">Products discussed</p>
              </button>
            </div>
          </>
        )}
      </Modal>
    </PageBody>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-card border border-surface p-2.5 text-center">
      <Icon
        size={13}
        className={`mx-auto mb-1 ${
          tone === 'positive'
            ? 'text-emerald-600 dark:text-emerald-400'
            : tone === 'warning'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-muted-foreground'
        }`}
      />
      <p className="text-[13px] font-bold text-main tabular-nums leading-none">{value}</p>
      <p className="text-[9.5px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={13} className="text-muted-foreground flex-shrink-0" />
      <span className="text-[11.5px] text-muted-foreground flex-1">{label}</span>
      <span className="text-[12px] font-semibold text-main text-right">{value}</span>
    </div>
  );
}
