'use client';

import { DrawerPanel, DrawerSection, FieldRow } from '@/components/shared/drawer-panel';
import { MetaPill, ProgressBar, StatusPill, type Tone } from '@/components/shared/status-pill';
import { ActionButton } from '@/components/shared/page-header';
import { RepAvatar } from '@/components/planning/rep-avatar';
import { historyFor, repById, type CrmCustomer, type CustomerStatus } from '@/lib/data/crm';
import { formatCurrency, formatDate, relativeDays } from '@/lib/data/seed';
import { motion } from 'framer-motion';
import {
  Banknote,
  Building2,
  CalendarClock,
  ClipboardList,
  Clock,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export const STATUS_TONE: Record<CustomerStatus, Tone> = {
  Active: 'positive',
  Prospect: 'info',
  'Needs Follow-up': 'warning',
  'At Risk': 'critical',
  Inactive: 'neutral',
};

const ACTIVITY_ICON = {
  Visit: MapPin,
  Call: Phone,
  Email: Mail,
  Quotation: FileText,
  Order: ShoppingCart,
  Note: ClipboardList,
} as const;

const TABS = ['Overview', 'Orders', 'Quotations', 'Activity'] as const;
type Tab = (typeof TABS)[number];

/**
 * Contextual customer record.
 *
 * A drawer rather than a route: the manager is working a list, and losing the
 * list's scroll position and filters to inspect one account is the fastest way
 * to make a workflow feel slow.
 */
export function CustomerDrawer({
  customer,
  onClose,
  onAction,
}: {
  customer: CrmCustomer | null;
  onClose: () => void;
  onAction?: (action: string, customer: CrmCustomer) => void;
}) {
  const [tab, setTab] = useState<Tab>('Overview');
  const history = useMemo(
    () => (customer ? historyFor(customer.id) : null),
    [customer]
  );

  if (!customer || !history) {
    return (
      <DrawerPanel open={false} onClose={onClose} title="">
        {null}
      </DrawerPanel>
    );
  }

  const rep = repById(customer.repId);
  const followUp = relativeDays(customer.nextFollowUp);
  const creditUsed = customer.creditLimit
    ? Math.round((customer.outstanding / customer.creditLimit) * 100)
    : 0;

  return (
    <DrawerPanel
      open
      onClose={onClose}
      title={customer.name}
      subtitle={`${customer.code} · ${customer.type}`}
      icon={Building2}
      width="w-full sm:w-[480px] lg:w-[540px]"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <ActionButton icon={FileText} onClick={() => onAction?.('quotation', customer)}>
            Create quotation
          </ActionButton>
          <ActionButton
            icon={CalendarClock}
            tone="primary"
            onClick={() => onAction?.('visit', customer)}
          >
            Schedule visit
          </ActionButton>
        </div>
      }
    >
      {/* Status strip — the answer to "what needs my attention" */}
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusPill label={customer.status} tone={STATUS_TONE[customer.status]} />
        <MetaPill label={customer.category} />
        <MetaPill label={customer.tier} />
        <MetaPill label={customer.province} icon={MapPin} />
      </div>

      {followUp && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-card border ${
            followUp.days < 0
              ? 'bg-rose-500/10 border-rose-500/20'
              : followUp.days <= 2
                ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-muted/40 border-surface'
          }`}
        >
          <CalendarClock
            size={15}
            className={
              followUp.days < 0
                ? 'text-rose-600 dark:text-rose-400'
                : followUp.days <= 2
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
            }
          />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-main">
              {followUp.days < 0 ? 'Follow-up overdue' : 'Next follow-up'} · {followUp.label}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              {formatDate(customer.nextFollowUp)} · last visit {formatDate(customer.lastVisit)}
            </p>
          </div>
        </div>
      )}

      {/* Sales summary */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Sales value" value={formatCurrency(customer.salesValue, true)} />
        <Stat label="Visits" value={String(customer.totalVisits)} />
        <Stat label="Open deals" value={String(customer.openOpportunities)} />
      </div>

      {/* Tabs keep the drawer shallow instead of one long scroll */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted/50" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`relative flex-1 h-8 rounded-lg text-[11.5px] font-medium transition-colors ${
              tab === t ? 'text-primary' : 'text-muted-foreground hover:text-main'
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="customer-drawer-tab"
                className="absolute inset-0 rounded-lg bg-card shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          <DrawerSection title="Contact information">
            <div className="rounded-card border border-surface px-3">
              <FieldRow label="Contact person" value={customer.contactPerson} icon={User} />
              <FieldRow
                label="Phone"
                value={
                  <a href={`tel:${customer.phone}`} className="text-primary">
                    {customer.phone}
                  </a>
                }
                icon={Phone}
              />
              <FieldRow
                label="Email"
                value={
                  <a href={`mailto:${customer.email}`} className="text-primary break-all">
                    {customer.email}
                  </a>
                }
                icon={Mail}
              />
              <FieldRow label="Website" value={customer.website} icon={Globe} />
              <FieldRow label="Address" value={customer.address} icon={MapPin} />
              <FieldRow label="Working hours" value={customer.workingHours} icon={Clock} />
            </div>
          </DrawerSection>

          <DrawerSection title="Business information">
            <div className="rounded-card border border-surface px-3">
              <FieldRow label="Industry" value={customer.industry} />
              <FieldRow label="Segment" value={customer.segment} />
              <FieldRow label="Registration" value={customer.registrationNo} />
              <FieldRow label="Payment terms" value={customer.paymentTerms} />
              <FieldRow label="Sales org" value={customer.salesOrg} />
              <FieldRow label="Division" value={customer.division} />
              <FieldRow label="Customer since" value={formatDate(customer.createdAt)} />
            </div>
          </DrawerSection>

          <DrawerSection title="Credit position">
            <div className="rounded-card border border-surface p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-muted-foreground">Credit status</span>
                <StatusPill
                  label={customer.creditStatus}
                  tone={
                    customer.creditStatus === 'Good Standing'
                      ? 'positive'
                      : customer.creditStatus === 'Overdue'
                        ? 'critical'
                        : 'warning'
                  }
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-muted-foreground">Outstanding</span>
                  <span className="font-semibold text-main tabular-nums">
                    {formatCurrency(customer.outstanding)} / {formatCurrency(customer.creditLimit)}
                  </span>
                </div>
                <ProgressBar
                  value={creditUsed}
                  tone={creditUsed > 80 ? 'critical' : creditUsed > 55 ? 'warning' : 'positive'}
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Assigned sales rep">
            {rep ? (
              <div className="flex items-center gap-3 p-3 rounded-card border border-surface">
                <RepAvatar rep={rep} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-main truncate">{rep.name}</p>
                  <p className="text-[10.5px] text-muted-foreground truncate">
                    {rep.employeeId} · {rep.team} · {rep.province}
                  </p>
                </div>
                <ActionButton onClick={() => onAction?.('reassign', customer)}>
                  Reassign
                </ActionButton>
              </div>
            ) : (
              <p className="text-[11.5px] text-muted-foreground">Not assigned</p>
            )}
          </DrawerSection>

          <DrawerSection title="Notes">
            <p className="text-[11.5px] text-muted-foreground leading-relaxed p-3 rounded-card border border-surface">
              {customer.notes}
            </p>
          </DrawerSection>
        </>
      )}

      {tab === 'Orders' && (
        <DrawerSection title={`Recent orders (${history.orders.length})`}>
          <div className="space-y-1.5">
            {history.orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-3 rounded-card border border-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-main">{order.reference}</p>
                  <p className="text-[10.5px] text-muted-foreground truncate">{order.items}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDate(order.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-semibold text-main tabular-nums">
                    {formatCurrency(order.value)}
                  </p>
                  <div className="mt-1">
                    <StatusPill
                      size="sm"
                      label={order.status}
                      tone={
                        order.status === 'Delivered'
                          ? 'positive'
                          : order.status === 'Cancelled'
                            ? 'critical'
                            : 'info'
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DrawerSection>
      )}

      {tab === 'Quotations' && (
        <DrawerSection title={`Quotations (${history.quotations.length})`}>
          <div className="space-y-1.5">
            {history.quotations.map((q) => (
              <div key={q.id} className="flex items-center gap-3 p-3 rounded-card border border-surface">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-main">{q.reference}</p>
                  <p className="text-[10.5px] text-muted-foreground">
                    Issued {formatDate(q.date)} · valid to {formatDate(q.validUntil)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-semibold text-main tabular-nums">
                    {formatCurrency(q.value)}
                  </p>
                  <div className="mt-1">
                    <StatusPill
                      size="sm"
                      label={q.status}
                      tone={
                        q.status === 'Accepted'
                          ? 'positive'
                          : q.status === 'Rejected' || q.status === 'Expired'
                            ? 'critical'
                            : q.status === 'Draft'
                              ? 'neutral'
                              : 'info'
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DrawerSection>
      )}

      {tab === 'Activity' && (
        <DrawerSection title="Timeline">
          <ol className="relative">
            {history.activities.map((event, i) => {
              const Icon = ACTIVITY_ICON[event.type];
              return (
                <li key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-xl bg-muted/70 flex items-center justify-center">
                      <Icon size={12} className="text-muted-foreground" />
                    </div>
                    {i < history.activities.length - 1 && (
                      <div className="w-px flex-1 min-h-[14px] bg-border" />
                    )}
                  </div>
                  <div className="pb-4 min-w-0">
                    <p className="text-[10px] text-muted-foreground">{formatDate(event.date)}</p>
                    <p className="text-[12px] font-medium text-main mt-0.5">{event.title}</p>
                    <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                      {event.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </DrawerSection>
      )}
    </DrawerPanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-surface p-2.5">
      <p className="text-[9.5px] text-muted-foreground flex items-center gap-1 mb-1">
        <Banknote size={10} /> {label}
      </p>
      <p className="text-[13px] font-bold text-main tabular-nums truncate">{value}</p>
    </div>
  );
}
