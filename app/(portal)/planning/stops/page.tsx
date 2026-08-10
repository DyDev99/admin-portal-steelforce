'use client';

import { PageBody } from '@/components/shared/page-layout';
import { AssignStopDialog } from '@/components/planning/assign-stop-dialog';
import { FilterBar } from '@/components/planning/filter-bar';
import { SectionHeader, EmptyState } from '@/components/shared/section-header';
import { SkeletonList } from '@/components/shared/skeletons';
import { StopCard } from '@/components/planning/stop-card';
import { SummaryCard } from '@/components/shared/summary-card';
import { usePlanning } from '@/lib/planning/store';
import { STATUS_TONE } from '@/lib/planning/tokens';
import { STOP_STATUSES, type StopStatus, type StopView } from '@/lib/planning/types';
import { useDemoLoading } from '@/hooks/use-demo-loading';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  MapPin,
  SearchX,
  Timer,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const PAGE_SIZE = 18;

export default function TodaysStopsPage() {
  const loading = useDemoLoading();
  const { filtered, kpis, selectStop, assignStop, unassignStop } = usePlanning();
  const [statusTab, setStatusTab] = useState<StopStatus | 'All'>('All');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [pickerStop, setPickerStop] = useState<StopView | null>(null);

  const byStatus = useMemo(
    () =>
      statusTab === 'All' ? filtered : filtered.filter((s) => s.status === statusTab),
    [filtered, statusTab]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: filtered.length };
    STOP_STATUSES.forEach((s) => {
      map[s] = filtered.filter((v) => v.status === s).length;
    });
    return map;
  }, [filtered]);

  const page = byStatus.slice(0, limit);

  return (
    <PageBody>
      <FilterBar />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          index={0}
          label="Stops today"
          value={kpis.total}
          icon={ClipboardList}
          color="#2563EB"
          hint="Across all sales organisations"
        />
        <SummaryCard
          index={1}
          label="Completed"
          value={kpis.completed}
          icon={CheckCircle2}
          color="#10B981"
          progress={kpis.total ? (kpis.completed / kpis.total) * 100 : 0}
        />
        <SummaryCard
          index={2}
          label="In progress"
          value={kpis.inProgress}
          icon={Timer}
          color="#F59E0B"
          hint="Reps currently on site"
        />
        <SummaryCard
          index={3}
          label="Unassigned"
          value={kpis.unassigned}
          icon={MapPin}
          color="#F43F5E"
          progress={kpis.total ? (kpis.unassigned / kpis.total) * 100 : 0}
        />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {(['All', ...STOP_STATUSES] as const).map((status) => {
          const active = statusTab === status;
          const tone = status === 'All' ? null : STATUS_TONE[status];
          return (
            <button
              key={status}
              onClick={() => {
                setStatusTab(status);
                setLimit(PAGE_SIZE);
              }}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-colors ${
                active ? 'text-main' : 'text-muted-foreground hover:text-main'
              }`}
            >
              {tone && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone.hex }} />
              )}
              {status}
              <span className="px-1.5 py-px rounded-md bg-muted text-[10px] font-bold tabular-nums">
                {counts[status] ?? 0}
              </span>
              {active && (
                <motion.span
                  layoutId="stops-status-tab"
                  className="absolute inset-0 rounded-xl bg-accent/60 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <SectionHeader
        title="Customer stops"
        subtitle="Click any card to open the full stop detail"
        icon={CalendarRange}
        count={byStatus.length}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SkeletonList count={6} />
        </div>
      ) : page.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No stops match these filters"
          hint="Try clearing the search box or resetting the filter bar."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {page.map((stop, i) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={i}
                  onOpen={(s) => selectStop(s.id)}
                  onAssign={(s) => setPickerStop(s)}
                  onNavigate={(s) =>
                    toast.info('Navigation sent to the field app', {
                      description: `${s.customer.name} · ${s.customer.address}`,
                    })
                  }
                  onRemove={(s) => {
                    unassignStop(s.id);
                    toast.info('Stop returned to the queue', { description: s.customer.name });
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {byStatus.length > limit && (
            <button
              onClick={() => setLimit((l) => l + PAGE_SIZE)}
              className="w-full h-10 rounded-xl border border-surface text-[12px] font-medium text-muted-foreground hover:text-main hover:bg-accent/40 transition-colors"
            >
              Show {Math.min(PAGE_SIZE, byStatus.length - limit)} more of {byStatus.length}
            </button>
          )}
        </>
      )}

      {/* Assign sheet */}
      <AssignStopDialog
        stop={pickerStop}
        onClose={() => setPickerStop(null)}
        onPick={(stop, rep) => {
          assignStop(stop.id, rep.id);
          toast.success(`Assigned to ${rep.name}`, {
            description: `${stop.customer.name} added to the route.`,
            action: { label: 'Undo', onClick: () => unassignStop(stop.id) },
          });
          setPickerStop(null);
        }}
      />
    </PageBody>
  );
}
