import {
  BarChart3,
  BookOpen,
  Boxes,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  List,
  Map,
  MapPin,
  Navigation,
  Package,
  Route,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { roleHas } from './auth/permissions';
import type { Permission, Role } from './auth/types';

/**
 * Single source of truth for the portal's navigation.
 *
 * Every menu entry — label, icon, route, nesting and ordering — is declared
 * here. The sidebar renders whatever this file describes, so adding a module
 * means adding one object, not touching UI code.
 */

export interface NavLeaf {
  kind: 'leaf';
  id: string;
  /** i18n key; `label` is the English fallback when a key is missing. */
  labelKey: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission required to see this item and open its route. */
  permission: Permission;
  /**
   * When true the item also matches deeper paths (`/planning/board`).
   * A more specific sibling still wins — see `resolveActiveNav`.
   */
  matchPrefix?: boolean;
}

export interface NavGroup {
  kind: 'group';
  id: string;
  labelKey: string;
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export type NavNode = NavLeaf | NavGroup;

export interface NavSection {
  id: string;
  labelKey: string;
  label: string;
  nodes: NavNode[];
}

const leaf = (
  id: string,
  label: string,
  href: string,
  icon: LucideIcon,
  permission: Permission,
  matchPrefix = false
): NavLeaf => ({
  kind: 'leaf',
  id,
  labelKey: `nav.${id}`,
  label,
  href,
  icon,
  permission,
  matchPrefix,
});

const group = (id: string, label: string, icon: LucideIcon, children: NavLeaf[]): NavGroup => ({
  kind: 'group',
  id,
  labelKey: `nav.${id}`,
  label,
  icon,
  children,
});

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'main',
    labelKey: 'nav.section.main',
    label: 'Main Menu',
    nodes: [
      leaf('dashboard', 'Dashboard', '/dashboard', LayoutDashboard, 'dashboard.view'),

      group('customers', 'Customers', Users, [
        leaf('customerList', 'Customer List', '/customers', List, 'customers.view'),
        leaf('myCustomers', 'My Customers', '/customers/my', Star, 'customers.view'),
        leaf('newCustomer', 'New Customer', '/customers/new', UserPlus, 'customers.manage'),
      ]),

      group('sales', 'Sales', TrendingUp, [
        leaf('quotations', 'Quotations', '/quotations', FileText, 'sales.view'),
        leaf('orders', 'Orders', '/orders', ShoppingCart, 'sales.view'),
        leaf('opportunities', 'Opportunities', '/opportunities', Target, 'sales.view'),
      ]),

      group('products', 'Products', Package, [
        leaf('catalog', 'Catalog', '/products', BookOpen, 'products.view'),
        leaf('categories', 'Categories', '/products/categories', LayoutGrid, 'products.view'),
        leaf('inventory', 'Inventory', '/products/inventory', Boxes, 'products.view'),
      ]),
    ],
  },
  {
    id: 'operations',
    labelKey: 'nav.section.operations',
    label: 'Operations',
    nodes: [
      group('fieldOps', 'Field Operations', Route, [
        // `/planning` owns its sub-tabs, except `/planning/map` which the
        // Routes entry claims explicitly — longest match wins.
        leaf('planning', 'Planning', '/planning', CalendarRange, 'field.view', true),
        leaf('salesReps', 'Sales Reps', '/sales-reps', UserCheck, 'field.view'),
        leaf('visits', 'Visits', '/visits', MapPin, 'field.view'),
        leaf('routes', 'Routes', '/planning/map', Navigation, 'field.view'),
        leaf('checkIn', 'Check-in', '/field/check-in', CheckCircle2, 'field.view'),
        leaf('dailyActivities', 'Daily Activities', '/field/activities', ClipboardList, 'field.view'),
      ]),

      group('reports', 'Reports', BarChart3, [
        leaf('salesReport', 'Sales Report', '/reports/sales', TrendingUp, 'reports.view'),
        leaf('visitReport', 'Visit Report', '/reports/visits', Map, 'reports.view'),
        leaf('performance', 'Performance', '/reports/performance', Gauge, 'reports.view'),
      ]),
    ],
  },
  {
    id: 'system',
    labelKey: 'nav.section.system',
    label: 'System',
    nodes: [
      group('administration', 'Administration', ShieldCheck, [
        leaf('userManagement', 'User Management', '/user-management', UserCog, 'users.manage', true),
        leaf('rolesPermissions', 'Roles & Permissions', '/user-management/roles', KeyRound, 'roles.manage'),
        leaf('settings', 'Settings', '/settings', Settings, 'settings.manage'),
      ]),
    ],
  },
];

export function isNavGroup(node: NavNode): node is NavGroup {
  return node.kind === 'group';
}

/** Flat list of every leaf, used for active resolution and route checks. */
export const NAV_LEAVES: NavLeaf[] = NAV_SECTIONS.flatMap((section) =>
  section.nodes.flatMap((node) => (isNavGroup(node) ? node.children : [node]))
);

export interface ActiveNav {
  leafId: string | null;
  groupId: string | null;
  sectionId: string | null;
}

/**
 * Resolves the highlighted item for a pathname.
 *
 * Matching is longest-wins so that a specific child (`/planning/map` → Routes,
 * `/user-management/roles` → Roles & Permissions) beats the prefix-matching
 * parent that would otherwise also claim the path.
 */
export function resolveActiveNav(pathname: string): ActiveNav {
  let best: { leaf: NavLeaf; score: number } | null = null;

  for (const section of NAV_SECTIONS) {
    for (const node of section.nodes) {
      const candidates = isNavGroup(node) ? node.children : [node];
      for (const item of candidates) {
        const exact = pathname === item.href;
        const prefixed = item.matchPrefix && pathname.startsWith(`${item.href}/`);
        if (!exact && !prefixed) continue;
        // Exact beats prefix; between prefixes the longer href wins.
        const score = exact ? item.href.length + 1000 : item.href.length;
        if (!best || score > best.score) best = { leaf: item, score };
      }
    }
  }

  if (!best) return { leafId: null, groupId: null, sectionId: null };

  for (const section of NAV_SECTIONS) {
    for (const node of section.nodes) {
      if (isNavGroup(node)) {
        if (node.children.some((child) => child.id === best!.leaf.id)) {
          return { leafId: best.leaf.id, groupId: node.id, sectionId: section.id };
        }
      } else if (node.id === best.leaf.id) {
        return { leafId: best.leaf.id, groupId: null, sectionId: section.id };
      }
    }
  }

  return { leafId: best.leaf.id, groupId: null, sectionId: null };
}

/**
 * Authorization-aware view of the menu.
 *
 * Unauthorized items are removed, not disabled — a Finance user has no reason
 * to see that Field Operations exists. A group disappears once none of its
 * children survive, so no empty headers are left behind.
 */
export function navigationFor(role: Role | null): NavSection[] {
  if (!role) return [];
  return NAV_SECTIONS.map((section) => ({
    ...section,
    nodes: section.nodes.reduce<NavNode[]>((nodes, node) => {
      if (isNavGroup(node)) {
        const children = node.children.filter((child) => roleHas(role, child.permission));
        if (children.length > 0) nodes.push({ ...node, children });
      } else if (roleHas(role, node.permission)) {
        nodes.push(node);
      }
      return nodes;
    }, []),
  })).filter((section) => section.nodes.length > 0);
}
