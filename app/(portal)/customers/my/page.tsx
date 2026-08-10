'use client';

import { PageBody, PageToolbar, ToolbarRow } from '@/components/shared/page-layout';
import { PageHeader, ActionButton, StandardActions } from '@/components/shared/page-header';
import { SearchBar } from '@/components/shared/search-bar';
import { FilterChip } from '@/components/shared/filter-chip';
import { SummaryCard } from '@/components/shared/summary-card';
import { BulkActionBar, DataTable, type Column, type RowAction } from '@/components/shared/data-table';
import { MetaPill, StatusPill } from '@/components/shared/status-pill';
import { ConfirmDialog } from '@/components/shared/feedback';
import { CustomerDrawer, STATUS_TONE } from '@/components/customers/customer-drawer';
import { RepAvatar } from '@/components/planning/rep-avatar';
import { useDemoLoading } from '@/hooks/use-demo-loading';
import {
  CUSTOMER_STATUSES,
  customerMetrics,
  myCustomers,
  repById,
  type CrmCustomer,
} from '@/lib/data/crm';
import { formatCurrency, formatDate, relativeDays } from '@/lib/data/seed';
import { salesReps } from '@/lib/planning/demo-data';
import { CUSTOMER_TYPES, PROVINCES } from '@/lib/planning/types';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  DollarSign,
  Eye,
  FileText,
  Flag,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  RotateCcw,
  Sparkles,
  Store,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const FOLLOW_UP_OPTIONS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'Due this week' },
  { value: 'none', label: 'None scheduled' },
];

const REVENUE_OPTIONS = [
  { value: '0-50', label: 'Under $50k' },
  { value: '50-200', label: '$50k – $200k' },
  { value: '200-500', label: '$200k – $500k' },
  { value: '500+', label: 'Over $500k' },
];

const opts = (v: readonly string[]) => v.map((x) => ({ value: x, label: x }));

export default function MyCustomersPage() {
  const loading = useDemoLoading();
  const router = useRouter();
  const all = useMemo(() => myCustomers(), []);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [province, setProvince] = useState('All');
  const [type, setType] = useState('All');
  const [rep, setRep] = useState('All');
  const [followUp, setFollowUp] = useState('All');
  const [revenue, setRevenue] = useState('All');

  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<CrmCustomer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CrmCustomer | null>(null);

  const repOptions = useMemo(
    () => salesReps.map((r) => ({ value: r.id, label: r.name, hint: `${r.employeeId} · ${r.team}` })),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((c) => {
      if (status !== 'All' && c.status !== status) return false;
      if (province !== 'All' && c.province !== province) return false;
      if (type !== 'All' && c.type !== type) return false;
      if (rep !== 'All' && c.repId !== rep) return false;

      if (followUp !== 'All') {
        const rel = relativeDays(c.nextFollowUp);
        if (followUp === 'none' && rel) return false;
        if (followUp === 'overdue' && (!rel || rel.days >= 0)) return false;
        if (followUp === 'today' && (!rel || rel.days !== 0)) return false;
        if (followUp === 'week' && (!rel || rel.days < 0 || rel.days > 7)) return false;
      }

      if (revenue !== 'All') {
        const k = c.salesValue / 1000;
        if (revenue === '0-50' && k >= 50) return false;
        if (revenue === '50-200' && (k < 50 || k >= 200)) return false;
        if (revenue === '200-500' && (k < 200 || k >= 500)) return false;
        if (revenue === '500+' && k < 500) return false;
      }

      if (q) {
        const rp = repById(c.repId);
        const haystack = `${c.name} ${c.code} ${c.contactPerson} ${c.phone} ${c.district} ${c.province} ${rp?.name ?? ''}`;
        if (!haystack.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [all, search, status, province, type, rep, followUp, revenue]);

  const metrics = useMemo(() => customerMetrics(all), [all]);

  const activeFilters =
    [status, province, type, rep, followUp, revenue].filter((v) => v !== 'All').length +
    (search.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setStatus('All');
    setProvince('All');
    setType('All');
    setRep('All');
    setFollowUp('All');
    setRevenue('All');
  };

  const columns: Column<CrmCustomer>[] = [
    {
      key: 'customer',
      header: 'Customer',
      width: 'w-[240px]',
      sortValue: (c) => c.name,
      cell: (c) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-main truncate">{c.name}</span>
            <span className="block text-[10.5px] text-muted-foreground truncate">
              {c.code} · {c.type}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      secondary: true,
      sortValue: (c) => c.contactPerson,
      cell: (c) => (
        <span className="min-w-0 block">
          <span className="block truncate">{c.contactPerson}</span>
          <span className="block text-[10.5px] text-muted-foreground truncate">{c.phone}</span>
        </span>
      ),
    },
    {
      key: 'territory',
      header: 'Territory',
      secondary: true,
      sortValue: (c) => `${c.province} ${c.district}`,
      cell: (c) => (
        <span className="min-w-0 block">
          <span className="block truncate">{c.province}</span>
          <span className="block text-[10.5px] text-muted-foreground truncate">{c.district}</span>
        </span>
      ),
    },
    {
      key: 'lastVisit',
      header: 'Last visit',
      secondary: true,
      sortValue: (c) => c.lastVisit ?? '',
      cell: (c) => <span className="text-muted-foreground">{formatDate(c.lastVisit)}</span>,
    },
    {
      key: 'followUp',
      header: 'Next follow-up',
      sortValue: (c) => c.nextFollowUp ?? 'zzzz',
      cell: (c) => {
        const rel = relativeDays(c.nextFollowUp);
        if (!rel) return <span className="text-muted-foreground">—</span>;
        const overdue = rel.days < 0;
        return (
          <span
            className={`inline-flex items-center gap-1.5 ${
              overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''
            }`}
          >
            {overdue && <AlertTriangle size={11} className="flex-shrink-0" />}
            {rel.label}
          </span>
        );
      },
    },
    {
      key: 'salesValue',
      header: 'Sales value',
      align: 'right',
      sortValue: (c) => c.salesValue,
      cell: (c) => <span className="font-semibold">{formatCurrency(c.salesValue, true)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (c) => c.status,
      cell: (c) => <StatusPill label={c.status} tone={STATUS_TONE[c.status]} />,
    },
    {
      key: 'rep',
      header: 'Sales rep',
      secondary: true,
      sortValue: (c) => repById(c.repId)?.name ?? '',
      cell: (c) => {
        const r = repById(c.repId);
        if (!r) return <span className="text-muted-foreground">Unassigned</span>;
        return (
          <span className="flex items-center gap-2 min-w-0">
            <RepAvatar rep={r} size="sm" showStatus={false} />
            <span className="truncate text-[11.5px]">{r.name}</span>
          </span>
        );
      },
    },
  ];

  const mock = (label: string, c: CrmCustomer) => toast.success(label, { description: c.name });

  const actions: RowAction<CrmCustomer>[] = [
    { label: 'View details', icon: Eye, onSelect: (c) => setDetail(c) },
    { label: 'Edit customer', icon: Pencil, onSelect: (c) => mock('Edit form opened', c) },
    { label: 'Call contact', icon: Phone, onSelect: (c) => mock('Calling contact…', c) },
    { label: 'Send message', icon: MessageSquare, onSelect: (c) => mock('Message composer opened', c) },
    {
      label: 'Create quotation',
      icon: FileText,
      divider: true,
      onSelect: (c) => mock('Quotation draft created', c),
    },
    { label: 'Schedule visit', icon: CalendarPlus, onSelect: (c) => mock('Visit scheduled', c) },
    { label: 'Add activity', icon: ClipboardList, onSelect: (c) => mock('Activity logged', c) },
    {
      label: 'Remove customer',
      icon: Trash2,
      tone: 'danger',
      divider: true,
      onSelect: (c) => setConfirmDelete(c),
    },
  ];

  return (
    <PageBody>
      <PageHeader
        title="My Customers"
        subtitle="Manage and follow up with customers assigned to you."
        actions={
          <StandardActions
            addLabel="Add Customer"
            onAdd={() => router.push('/customers/new')}
            onImport={() =>
              toast.info('Import customers', {
                description: 'Upload a CSV or Excel file to bulk-create accounts.',
              })
            }
            onExport={() =>
              toast.success('Export queued', {
                description: `${filtered.length} customers will be written to CSV.`,
              })
            }
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard index={0} label="Total customers" value={metrics.total} icon={Users} color="#2563EB" hint="Assigned to your territory" />
        <SummaryCard index={1} label="Active" value={metrics.active} icon={UserCheck} color="#059669" progress={(metrics.active / Math.max(1, metrics.total)) * 100} />
        <SummaryCard index={2} label="Needs follow-up" value={metrics.needsFollowUp} icon={AlertTriangle} color="#D97706" hint="At risk or overdue" />
        <SummaryCard index={3} label="New this month" value={metrics.newThisMonth} icon={Sparkles} color="#7C3AED" />
        <SummaryCard index={4} label="Revenue" value={Math.round(metrics.revenue / 1000)} prefix="$" suffix="k" icon={DollarSign} color="#0EA5E9" hint="Trailing 12 months" />
      </div>

      <PageToolbar>
        <ToolbarRow>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search customer, code, contact or rep…"
            className="w-full sm:w-[290px]"
          />
          <FilterChip label="Status" icon={Flag} value={status} options={opts(CUSTOMER_STATUSES)} onChange={setStatus} allLabel="Any status" />
          <FilterChip label="Province" icon={MapPin} value={province} options={opts(PROVINCES)} onChange={setProvince} allLabel="All provinces" />
          <FilterChip label="Type" icon={Store} value={type} options={opts(CUSTOMER_TYPES)} onChange={setType} allLabel="All types" />
          <FilterChip label="Sales rep" icon={UserCheck} value={rep} options={repOptions} onChange={setRep} allLabel="All reps" searchable />
          <FilterChip label="Follow-up" icon={CalendarClock} value={followUp} options={FOLLOW_UP_OPTIONS} onChange={setFollowUp} allLabel="Any follow-up" />
          <FilterChip label="Revenue" icon={DollarSign} value={revenue} options={REVENUE_OPTIONS} onChange={setRevenue} allLabel="Any revenue" />
          {activeFilters > 0 && (
            <ActionButton icon={RotateCcw} onClick={clearFilters}>
              Clear ({activeFilters})
            </ActionButton>
          )}
        </ToolbarRow>
      </PageToolbar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">
          <span className="font-semibold text-main tabular-nums">{filtered.length}</span> of{' '}
          {all.length} customers{activeFilters > 0 && ' matching your filters'}
        </p>
        <MetaPill label="Click a row to open the full record" />
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        actions={actions}
        loading={loading}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        onRowClick={setDetail}
        pageSize={12}
        caption="Customers assigned to you"
        emptyTitle="No customers found"
        emptyHint="Try changing your filters, or create a new customer to get started."
        emptyAction={
          <div className="flex items-center gap-2">
            <ActionButton icon={RotateCcw} onClick={clearFilters}>
              Clear filters
            </ActionButton>
            <ActionButton icon={UserPlus} tone="primary" onClick={() => router.push('/customers/new')}>
              Create customer
            </ActionButton>
          </div>
        }
      />

      <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
        <ActionButton
          icon={UserCheck}
          onClick={() => {
            toast.success(`${selected.length} customers reassigned`, {
              description: 'Ownership moved to the selected sales rep.',
            });
            setSelected([]);
          }}
        >
          Reassign
        </ActionButton>
        <ActionButton
          icon={CalendarPlus}
          onClick={() => {
            toast.success(`Follow-up set for ${selected.length} customers`);
            setSelected([]);
          }}
        >
          Set follow-up
        </ActionButton>
        <ActionButton
          icon={Trash2}
          tone="danger"
          onClick={() => {
            toast.success(`${selected.length} customers archived`);
            setSelected([]);
          }}
        >
          Archive
        </ActionButton>
      </BulkActionBar>

      <CustomerDrawer
        customer={detail}
        onClose={() => setDetail(null)}
        onAction={(action, customer) => {
          if (action === 'quotation') toast.success('Quotation draft created', { description: customer.name });
          if (action === 'visit') toast.success('Visit scheduled', { description: customer.name });
          if (action === 'reassign') toast.info('Reassign owner', { description: 'Pick a sales rep to take ownership.' });
        }}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove this customer?"
        body={`${confirmDelete?.name ?? ''} will be archived and removed from your list. Historical orders are kept.`}
        confirmLabel="Remove"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          toast.success('Customer archived', { description: confirmDelete?.name });
          setConfirmDelete(null);
        }}
      />
    </PageBody>
  );
}
