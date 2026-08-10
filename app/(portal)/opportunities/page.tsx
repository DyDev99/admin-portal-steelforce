'use client';

import { PageBody, PageToolbar, ToolbarRow } from '@/components/shared/page-layout';
import { PageHeader, ActionButton } from '@/components/shared/page-header';
import { SearchBar } from '@/components/shared/search-bar';
import { FilterChip, ToggleChip } from '@/components/shared/filter-chip';
import { SummaryCard } from '@/components/shared/summary-card';
import { DataTable, type Column, type RowAction } from '@/components/shared/data-table';
import { MetaPill, ProgressBar, StatusPill, type Tone } from '@/components/shared/status-pill';
import { Modal } from '@/components/shared/feedback';
import { EmptyState } from '@/components/shared/section-header';
import { SelectField, TextField } from '@/components/shared/form';
import { RepAvatar } from '@/components/planning/rep-avatar';
import { useDemoLoading } from '@/hooks/use-demo-loading';
import {
  OPEN_STAGES,
  PRIORITIES,
  STAGES,
  STAGE_PROBABILITY,
  opportunities as seedOpportunities,
  pipelineMetrics,
  type Opportunity,
  type Stage,
} from '@/lib/data/pipeline';
import { repById } from '@/lib/data/crm';
import { formatCurrency, formatDate, relativeDays } from '@/lib/data/seed';
import { salesReps } from '@/lib/planning/demo-data';
import { PROVINCES } from '@/lib/planning/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  Flag,
  LayoutGrid,
  MapPin,
  Percent,
  Plus,
  RotateCcw,
  Table2,
  Target,
  TrendingUp,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const EASE = [0.22, 1, 0.36, 1] as const;

const STAGE_TONE: Record<Stage, Tone> = {
  Lead: 'neutral',
  Qualified: 'info',
  'Needs Analysis': 'info',
  Quotation: 'accent',
  Negotiation: 'warning',
  Won: 'positive',
  Lost: 'critical',
};

const PRIORITY_TONE: Record<string, Tone> = {
  Critical: 'critical',
  High: 'warning',
  Medium: 'info',
  Low: 'neutral',
};

const opts = (v: readonly string[]) => v.map((x) => ({ value: x, label: x }));

export default function OpportunitiesPage() {
  const loading = useDemoLoading();

  // Local copy so stage moves and win/loss persist for the session.
  const [deals, setDeals] = useState<Opportunity[]>(() => seedOpportunities.map((o) => ({ ...o })));
  const [view, setView] = useState<'board' | 'table'>('board');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('All');
  const [rep, setRep] = useState('All');
  const [priority, setPriority] = useState('All');
  const [province, setProvince] = useState('All');
  const [dragging, setDragging] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: '', customer: '', value: '', stage: 'Lead', repId: '' });

  const repOptions = useMemo(
    () => salesReps.map((r) => ({ value: r.id, label: r.name, hint: r.employeeId })),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((o) => {
      if (stage !== 'All' && o.stage !== stage) return false;
      if (rep !== 'All' && o.repId !== rep) return false;
      if (priority !== 'All' && o.priority !== priority) return false;
      if (province !== 'All' && o.province !== province) return false;
      if (q && !`${o.name} ${o.customerName} ${o.nextAction}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [deals, search, stage, rep, priority, province]);

  const metrics = useMemo(() => pipelineMetrics(deals), [deals]);

  const activeFilters =
    [stage, rep, priority, province].filter((v) => v !== 'All').length + (search.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setStage('All');
    setRep('All');
    setPriority('All');
    setProvince('All');
  };

  const moveStage = (id: string, target: Stage) => {
    setDeals((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, stage: target, probability: STAGE_PROBABILITY[target] } : o
      )
    );
    const deal = deals.find((o) => o.id === id);
    toast.success(`Moved to ${target}`, { description: deal?.name });
  };

  const columns: Column<Opportunity>[] = [
    {
      key: 'name',
      header: 'Opportunity',
      width: 'w-[220px]',
      sortValue: (o) => o.name,
      cell: (o) => (
        <span className="min-w-0 block">
          <span className="block font-semibold text-main truncate">{o.name}</span>
          <span className="block text-[10.5px] text-muted-foreground truncate">{o.id}</span>
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortValue: (o) => o.customerName,
      cell: (o) => <span className="truncate block">{o.customerName}</span>,
    },
    {
      key: 'stage',
      header: 'Stage',
      sortValue: (o) => STAGES.indexOf(o.stage),
      cell: (o) => <StatusPill label={o.stage} tone={STAGE_TONE[o.stage]} />,
    },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      sortValue: (o) => o.value,
      cell: (o) => <span className="font-semibold">{formatCurrency(o.value, true)}</span>,
    },
    {
      key: 'probability',
      header: 'Probability',
      align: 'right',
      sortValue: (o) => o.probability,
      cell: (o) => (
        <span className="inline-flex items-center gap-2 justify-end w-full">
          <ProgressBar value={o.probability} className="w-12" tone={o.probability >= 60 ? 'positive' : 'info'} />
          <span className="w-8 text-right">{o.probability}%</span>
        </span>
      ),
    },
    {
      key: 'close',
      header: 'Expected close',
      secondary: true,
      sortValue: (o) => o.expectedClose,
      cell: (o) => {
        const rel = relativeDays(o.expectedClose);
        const overdue = rel !== null && rel.days < 0 && o.stage !== 'Won' && o.stage !== 'Lost';
        return (
          <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
            {formatDate(o.expectedClose)}
          </span>
        );
      },
    },
    {
      key: 'rep',
      header: 'Sales rep',
      secondary: true,
      sortValue: (o) => repById(o.repId)?.name ?? '',
      cell: (o) => {
        const r = repById(o.repId);
        return r ? (
          <span className="flex items-center gap-2 min-w-0">
            <RepAvatar rep={r} size="sm" showStatus={false} />
            <span className="truncate text-[11.5px]">{r.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      key: 'next',
      header: 'Next action',
      secondary: true,
      cell: (o) => <span className="text-muted-foreground truncate block">{o.nextAction}</span>,
    },
  ];

  const actions: RowAction<Opportunity>[] = [
    { label: 'Create quotation', icon: FileText, onSelect: (o) => toast.success('Quotation drafted', { description: o.name }) },
    { label: 'Schedule visit', icon: CalendarPlus, onSelect: (o) => toast.success('Visit scheduled', { description: o.customerName }) },
    { label: 'Add activity', icon: ClipboardList, onSelect: (o) => toast.success('Activity logged', { description: o.name }) },
    { label: 'Mark won', icon: CheckCircle2, divider: true, visible: (o) => o.stage !== 'Won', onSelect: (o) => moveStage(o.id, 'Won') },
    { label: 'Mark lost', icon: XCircle, tone: 'danger', visible: (o) => o.stage !== 'Lost', onSelect: (o) => moveStage(o.id, 'Lost') },
  ];

  return (
    <PageBody>
      <PageHeader
        title="Opportunities"
        subtitle="Track potential sales from first contact through quotation to a closed order."
        actions={
          <ActionButton icon={Plus} tone="primary" onClick={() => setCreating(true)}>
            New Opportunity
          </ActionButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard index={0} label="Pipeline value" value={Math.round(metrics.pipelineValue / 1000)} prefix="$" suffix="k" icon={Target} color="#2563EB" hint="Open opportunities" />
        <SummaryCard index={1} label="Open deals" value={metrics.openCount} icon={ClipboardList} color="#0EA5E9" />
        <SummaryCard index={2} label="Weighted pipeline" value={Math.round(metrics.weighted / 1000)} prefix="$" suffix="k" icon={Percent} color="#7C3AED" hint="Value × probability" />
        <SummaryCard index={3} label="Won this month" value={Math.round(metrics.wonThisMonth / 1000)} prefix="$" suffix="k" icon={CheckCircle2} color="#059669" />
        <SummaryCard index={4} label="Win rate" value={metrics.winRate} suffix="%" icon={TrendingUp} color="#D97706" progress={metrics.winRate} />
        <SummaryCard index={5} label="Average deal" value={Math.round(metrics.averageDeal / 1000)} prefix="$" suffix="k" icon={DollarSign} color="#E11D48" />
      </div>

      <PageToolbar>
        <ToolbarRow>
          <SearchBar value={search} onChange={setSearch} placeholder="Search opportunity or customer…" className="w-full sm:w-[280px]" />
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
            <ToggleChip label="Board" icon={LayoutGrid} active={view === 'board'} onClick={() => setView('board')} />
            <ToggleChip label="Table" icon={Table2} active={view === 'table'} onClick={() => setView('table')} />
          </div>
          <FilterChip label="Stage" icon={Flag} value={stage} options={opts(STAGES)} onChange={setStage} allLabel="All stages" />
          <FilterChip label="Sales rep" icon={UserCheck} value={rep} options={repOptions} onChange={setRep} allLabel="All reps" searchable />
          <FilterChip label="Priority" icon={Target} value={priority} options={opts(PRIORITIES)} onChange={setPriority} allLabel="Any priority" />
          <FilterChip label="Province" icon={MapPin} value={province} options={opts(PROVINCES)} onChange={setProvince} allLabel="All provinces" />
          {activeFilters > 0 && (
            <ActionButton icon={RotateCcw} onClick={clearFilters}>
              Clear ({activeFilters})
            </ActionButton>
          )}
        </ToolbarRow>
      </PageToolbar>

      {view === 'board' ? (
        <BoardView
          deals={filtered}
          dragging={dragging}
          onDragState={setDragging}
          onMove={moveStage}
          loading={loading}
        />
      ) : (
        <DataTable
          rows={filtered}
          columns={columns}
          actions={actions}
          loading={loading}
          pageSize={12}
          caption="Opportunity pipeline"
          emptyTitle="No opportunities match"
          emptyHint="Adjust the filters, or create a new opportunity."
          emptyAction={
            <ActionButton icon={RotateCcw} onClick={clearFilters}>
              Clear filters
            </ActionButton>
          }
        />
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New opportunity"
        subtitle="Capture the essentials — the rest can be filled in as the deal develops."
        icon={Target}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setCreating(false)}>Cancel</ActionButton>
            <ActionButton
              tone="primary"
              icon={Plus}
              onClick={() => {
                if (!newDeal.name.trim() || !newDeal.customer.trim()) {
                  toast.error('Name and customer are required');
                  return;
                }
                const created: Opportunity = {
                  id: `OPP-${String(deals.length + 1).padStart(3, '0')}`,
                  name: newDeal.name,
                  customerId: 'CUS-000',
                  customerName: newDeal.customer,
                  stage: newDeal.stage as Stage,
                  value: Number(newDeal.value) || 0,
                  probability: STAGE_PROBABILITY[newDeal.stage as Stage],
                  expectedClose: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                  repId: newDeal.repId || salesReps[0].id,
                  priority: 'Medium',
                  lastActivity: 'Opportunity created',
                  lastActivityAt: new Date().toISOString().slice(0, 10),
                  nextAction: 'Qualify the requirement',
                  createdAt: new Date().toISOString().slice(0, 10),
                  province: 'Phnom Penh',
                };
                setDeals((prev) => [created, ...prev]);
                setCreating(false);
                setNewDeal({ name: '', customer: '', value: '', stage: 'Lead', repId: '' });
                toast.success('Opportunity created', { description: created.name });
              }}
            >
              Create
            </ActionButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Opportunity name" required value={newDeal.name} onChange={(v) => setNewDeal((p) => ({ ...p, name: v }))} placeholder="Q4 reinforcement supply" full />
          <TextField label="Customer" required value={newDeal.customer} onChange={(v) => setNewDeal((p) => ({ ...p, customer: v }))} placeholder="Mekong Construction Supply" full />
          <TextField label="Estimated value" prefix="$" value={newDeal.value} onChange={(v) => setNewDeal((p) => ({ ...p, value: v }))} placeholder="45000" />
          <SelectField label="Stage" value={newDeal.stage} onChange={(v) => setNewDeal((p) => ({ ...p, stage: v }))} options={OPEN_STAGES} />
          <SelectField label="Sales representative" value={newDeal.repId} onChange={(v) => setNewDeal((p) => ({ ...p, repId: v }))} options={repOptions} full />
        </div>
      </Modal>
    </PageBody>
  );
}

/**
 * Kanban board.
 *
 * Only the open stages get columns — Won and Lost are outcomes, not queues,
 * and giving them columns encourages parking deals there instead of closing
 * them. Both are reachable from the card's own actions.
 */
function BoardView({
  deals,
  dragging,
  onDragState,
  onMove,
  loading,
}: {
  deals: Opportunity[];
  dragging: string | null;
  onDragState: (id: string | null) => void;
  onMove: (id: string, stage: Stage) => void;
  loading: boolean;
}) {
  const [over, setOver] = useState<Stage | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {OPEN_STAGES.map((s) => (
          <div key={s} className="rounded-card border border-surface bg-card p-3 space-y-2">
            <div className="skeleton h-4 w-1/2 rounded-md" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-24 rounded-card" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const open = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
  if (open.length === 0) {
    return (
      <div className="rounded-card border border-surface bg-card">
        <EmptyState
          icon={Target}
          title="No open opportunities"
          hint="Every deal matching these filters is already won or lost."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
      {OPEN_STAGES.map((columnStage) => {
        const column = open.filter((d) => d.stage === columnStage);
        const value = column.reduce((sum, d) => sum + d.value, 0);
        const isOver = over === columnStage;

        return (
          <section
            key={columnStage}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(columnStage);
            }}
            onDragLeave={() => setOver((s) => (s === columnStage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              onDragState(null);
              const id = e.dataTransfer.getData('text/plain');
              if (id) onMove(id, columnStage);
            }}
            className={`rounded-card border bg-card transition-colors ${
              isOver ? 'border-primary/50 bg-primary/5' : 'border-surface'
            }`}
          >
            <header className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-surface">
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-main truncate">{columnStage}</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  {column.length} · {formatCurrency(value, true)}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground tabular-nums flex-shrink-0">
                {STAGE_PROBABILITY[columnStage]}%
              </span>
            </header>

            <div className="p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-380px)] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {column.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    dragging={dragging === deal.id}
                    onDragState={onDragState}
                  />
                ))}
              </AnimatePresence>

              {column.length === 0 && (
                <p className="text-[10.5px] text-muted-foreground text-center py-6">
                  {isOver ? 'Drop to move here' : 'No deals in this stage'}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DealCard({
  deal,
  dragging,
  onDragState,
}: {
  deal: Opportunity;
  dragging: boolean;
  onDragState: (id: string | null) => void;
}) {
  const rep = repById(deal.repId);
  const rel = relativeDays(deal.expectedClose);
  const overdue = rel !== null && rel.days < 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: dragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: EASE }}
      draggable
      onDragStart={(e) => {
        (e as unknown as React.DragEvent).dataTransfer.setData('text/plain', deal.id);
        onDragState(deal.id);
      }}
      onDragEnd={() => onDragState(null)}
      className="rounded-card border border-surface bg-card-surface p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-semibold text-main leading-snug">{deal.name}</p>
        <StatusPill size="sm" label={deal.priority} tone={PRIORITY_TONE[deal.priority]} />
      </div>
      <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">{deal.customerName}</p>

      <div className="flex items-center justify-between gap-2 mt-2.5">
        <span className="text-[13px] font-bold text-main tabular-nums">
          {formatCurrency(deal.value, true)}
        </span>
        <span className="text-[10.5px] text-muted-foreground tabular-nums">
          {deal.probability}%
        </span>
      </div>
      <ProgressBar value={deal.probability} className="mt-1.5" tone={deal.probability >= 60 ? 'positive' : 'info'} />

      <div className="flex items-center gap-1.5 mt-2.5 text-[10px]">
        <CalendarClock size={10} className="text-muted-foreground flex-shrink-0" />
        <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-muted-foreground'}>
          {rel?.label ?? formatDate(deal.expectedClose)}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-surface">
        {rep && <RepAvatar rep={rep} size="sm" showStatus={false} />}
        <span className="text-[10.5px] text-muted-foreground truncate flex-1">
          {rep?.name ?? 'Unassigned'}
        </span>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
        <span className="font-semibold text-main">Next:</span> {deal.nextAction}
      </p>
      <MetaPill label={deal.lastActivity} />
    </motion.article>
  );
}
