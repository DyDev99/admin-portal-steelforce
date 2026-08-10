import { customers as baseCustomers, salesReps } from '@/lib/planning/demo-data';
import type { Customer, SalesRep } from '@/lib/planning/types';
import { isoDate, makeRng, TODAY } from './seed';

/**
 * CRM view over the customer master.
 *
 * The 200 trading accounts and 20 reps already exist in the planning module.
 * Rather than inventing a second, contradictory directory, this layer decorates
 * those records with the commercial fields the CRM screens need — so a customer
 * shown on the Stop Planning map is the same customer shown in My Customers.
 */

export const CUSTOMER_STATUSES = [
  'Active',
  'Prospect',
  'Needs Follow-up',
  'At Risk',
  'Inactive',
] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export const INDUSTRIES = [
  'Construction',
  'Building Materials Retail',
  'Infrastructure',
  'Manufacturing',
  'Property Development',
  'Wholesale Distribution',
] as const;

export const CUSTOMER_CATEGORIES = ['Key Account', 'Growth', 'Standard', 'Watchlist'] as const;
export const PAYMENT_TERMS = ['Cash on delivery', 'Net 15', 'Net 30', 'Net 45', 'Net 60'] as const;
export const CUSTOMER_SEGMENTS = ['Enterprise', 'Mid-market', 'Small business', 'Project-based'] as const;

export interface CrmCustomer extends Customer {
  status: CustomerStatus;
  industry: string;
  category: string;
  segment: string;
  paymentTerms: string;
  email: string;
  website: string;
  registrationNo: string;
  /** Trailing-12-month revenue — what the list sorts and totals on. */
  salesValue: number;
  monthlyRevenue: number;
  nextFollowUp: string | null;
  repId: string;
  createdAt: string;
  openOpportunities: number;
}

function buildCustomers(): CrmCustomer[] {
  const rng = makeRng(94117);
  const workingReps = salesReps.filter((r) => r.status !== 'Offline');

  return baseCustomers.map((customer, i) => {
    // Status leans healthy but leaves a realistic tail needing attention.
    const status = rng.weighted<CustomerStatus>([
      ['Active', 10],
      ['Needs Follow-up', 3],
      ['Prospect', 3],
      ['At Risk', 2],
      ['Inactive', 1],
    ]);

    // Follow-ups cluster near today so the "due" filters have real content.
    const followUpOffset = rng.int(-9, 21);
    const needsFollowUp = status === 'Needs Follow-up' || status === 'At Risk';

    const rep = workingReps.find((r) => r.province === customer.province) ??
      workingReps[i % workingReps.length];

    const slug = customer.name.toLowerCase().replace(/[^a-z0-9]+/g, '');

    return {
      ...customer,
      status,
      industry: rng.pick(INDUSTRIES),
      category:
        customer.tier === 'Platinum'
          ? 'Key Account'
          : customer.tier === 'Gold'
            ? 'Growth'
            : status === 'At Risk'
              ? 'Watchlist'
              : 'Standard',
      segment: rng.pick(CUSTOMER_SEGMENTS),
      paymentTerms: rng.pick(PAYMENT_TERMS),
      email: `${slug.slice(0, 18)}@${slug.slice(0, 12)}.com.kh`,
      website: `www.${slug.slice(0, 14)}.com.kh`,
      registrationNo: `KH-${String(100000 + i * 37).slice(0, 6)}-${String(rng.int(10, 99))}`,
      salesValue: customer.lifetimeValue,
      monthlyRevenue: Math.round(customer.lifetimeValue / rng.int(14, 30) / 100) * 100,
      nextFollowUp:
        status === 'Inactive' ? null : isoDate(needsFollowUp ? rng.int(-9, 3) : followUpOffset),
      repId: rep.id,
      createdAt: isoDate(-rng.int(20, 900)),
      openOpportunities: rng.chance(0.4) ? rng.int(1, 3) : 0,
    };
  });
}

export const crmCustomers: CrmCustomer[] = buildCustomers();

export const crmCustomerById: Record<string, CrmCustomer> = Object.fromEntries(
  crmCustomers.map((c) => [c.id, c])
);

export function repById(id: string): SalesRep | undefined {
  return salesReps.find((r) => r.id === id);
}

/**
 * The signed-in rep's book of business. The demo portal signs in as a manager,
 * so "mine" means the territory this account owns rather than one rep's list.
 */
export const MY_REP_IDS = salesReps.slice(0, 6).map((r) => r.id);

export function myCustomers(): CrmCustomer[] {
  return crmCustomers.filter((c) => MY_REP_IDS.includes(c.repId));
}

export interface CustomerMetrics {
  total: number;
  active: number;
  needsFollowUp: number;
  newThisMonth: number;
  revenue: number;
}

export function customerMetrics(list: CrmCustomer[]): CustomerMetrics {
  const monthStart = new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  return {
    total: list.length,
    active: list.filter((c) => c.status === 'Active').length,
    needsFollowUp: list.filter(
      (c) => c.status === 'Needs Follow-up' || c.status === 'At Risk'
    ).length,
    newThisMonth: list.filter((c) => c.createdAt >= monthStart).length,
    revenue: list.reduce((sum, c) => sum + c.salesValue, 0),
  };
}

// ── Related records shown in the customer drawer ────────────────────────────

export interface CustomerOrder {
  id: string;
  date: string;
  reference: string;
  items: string;
  value: number;
  status: 'Delivered' | 'In transit' | 'Processing' | 'Cancelled';
}

export interface CustomerQuotation {
  id: string;
  date: string;
  reference: string;
  value: number;
  validUntil: string;
  status: 'Accepted' | 'Sent' | 'Draft' | 'Expired' | 'Rejected';
}

export interface CustomerActivityEntry {
  id: string;
  date: string;
  type: 'Visit' | 'Call' | 'Email' | 'Quotation' | 'Order' | 'Note';
  title: string;
  detail: string;
  repId: string;
}

const ORDER_ITEMS = [
  'Deformed bar D12 · 8 t',
  'Zinc roofing sheet · 320 pcs',
  'Steel pipe 2" · 140 lengths',
  'Wire rod 6mm · 4 t',
  'Cement OPC · 600 bags',
  'Structural angle 50×50 · 2.5 t',
];

/** Per-customer history, generated on demand from the customer id. */
export function historyFor(customerId: string): {
  orders: CustomerOrder[];
  quotations: CustomerQuotation[];
  activities: CustomerActivityEntry[];
} {
  const seed = customerId.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) * 71;
  const rng = makeRng(seed);
  const customer = crmCustomerById[customerId];

  const orders: CustomerOrder[] = Array.from({ length: rng.int(2, 5) }, (_, i) => ({
    id: `${customerId}-ORD-${i}`,
    date: isoDate(-(i * rng.int(9, 26) + rng.int(1, 8))),
    reference: `SO-${26000 + rng.int(100, 999)}`,
    items: rng.pick(ORDER_ITEMS),
    value: rng.int(1200, 42000),
    status: rng.weighted([
      ['Delivered', 6],
      ['In transit', 2],
      ['Processing', 2],
      ['Cancelled', 1],
    ]),
  }));

  const quotations: CustomerQuotation[] = Array.from({ length: rng.int(1, 4) }, (_, i) => {
    const date = isoDate(-(i * rng.int(7, 20) + rng.int(1, 6)));
    return {
      id: `${customerId}-QT-${i}`,
      date,
      reference: `QT-${18000 + rng.int(100, 999)}`,
      value: rng.int(2000, 58000),
      validUntil: isoDate(rng.int(-8, 24)),
      status: rng.weighted([
        ['Sent', 4],
        ['Accepted', 3],
        ['Draft', 2],
        ['Expired', 1],
        ['Rejected', 1],
      ]),
    };
  });

  const templates: Array<[CustomerActivityEntry['type'], string, string]> = [
    ['Visit', 'Site visit completed', 'Stock check and shelf audit · 42 min on site'],
    ['Call', 'Follow-up call', 'Discussed the pending roofing sheet quotation'],
    ['Quotation', 'Quotation issued', 'Structural steel package for the Q3 project'],
    ['Order', 'Order confirmed', 'Delivery scheduled from the Phnom Penh depot'],
    ['Email', 'Price list sent', 'Updated August price list with contract rates'],
    ['Note', 'Account note added', 'Owner prefers deliveries before 10:00'],
  ];

  const activities: CustomerActivityEntry[] = Array.from({ length: 6 }, (_, i) => {
    const [type, title, detail] = templates[(i + rng.int(0, 5)) % templates.length];
    return {
      id: `${customerId}-ACT-${i}`,
      date: isoDate(-(i * rng.int(3, 11) + rng.int(0, 4))),
      type,
      title,
      detail,
      repId: customer?.repId ?? MY_REP_IDS[0],
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  return { orders, quotations, activities };
}
