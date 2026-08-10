'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  customersById,
  depotsById,
  depots,
  repsById,
  salesReps,
  stops as seedStops,
} from './demo-data';
import {
  hhmmToMinutes,
  minutesToHHMM,
  roadKm,
  routeDistanceKm,
  travelMinutes,
} from './geo';
import type {
  OptimizeStrategy,
  PlanningFilters,
  SalesRep,
  Stop,
  StopView,
} from './types';

const DAY_START = '08:00';
const TIER_WEIGHT: Record<string, number> = { Platinum: 0, Gold: 1, Silver: 2, Bronze: 3 };
const PRIORITY_WEIGHT: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export const DEFAULT_FILTERS: PlanningFilters = {
  search: '',
  salesOrg: 'All',
  division: 'All',
  province: 'All',
  district: 'All',
  customerType: 'All',
  priority: 'All',
  repId: 'All',
  assignment: 'All',
  visitDate: '2026-08-06',
};

export interface RouteSummary {
  repId: string;
  stops: StopView[];
  distanceKm: number;
  travelMinutes: number;
  serviceMinutes: number;
  totalMinutes: number;
  finishTime: string;
  orderValue: number;
}

interface PlanningContextValue {
  stops: Stop[];
  stopViews: StopView[];
  filtered: StopView[];
  unassigned: StopView[];
  assigned: StopView[];
  reps: SalesRep[];
  filters: PlanningFilters;
  setFilter: <K extends keyof PlanningFilters>(key: K, value: PlanningFilters[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;

  selectedStopId: string | null;
  selectStop: (id: string | null) => void;
  selectedStop: StopView | null;
  selectedRepId: string | null;
  selectRep: (id: string | null) => void;

  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;

  assignStop: (stopId: string, repId: string) => void;
  unassignStop: (stopId: string) => void;
  assignAllVisible: (repId: string) => number;
  reorderStop: (repId: string, stopId: string, targetIndex: number) => void;

  strategy: OptimizeStrategy;
  setStrategy: (s: OptimizeStrategy) => void;
  optimizing: boolean;
  optimize: (repId?: string) => Promise<number>;

  published: boolean;
  publish: () => Promise<void>;

  routeFor: (repId: string) => RouteSummary;
  workloadFor: (repId: string) => { count: number; capacity: number; ratio: number };
  kpis: {
    total: number;
    assigned: number;
    unassigned: number;
    completed: number;
    inProgress: number;
    repsWorking: number;
    coverage: number;
    avgDistance: number;
    totalDistance: number;
    plannedMinutes: number;
    orderValue: number;
  };
  lastAssignment: { stopId: string; repId: string; at: number } | null;
}

const PlanningContext = createContext<PlanningContextValue | null>(null);

function matches(view: StopView, f: PlanningFilters): boolean {
  const c = view.customer;
  if (f.salesOrg !== 'All' && c.salesOrg !== f.salesOrg) return false;
  if (f.division !== 'All' && c.division !== f.division) return false;
  if (f.province !== 'All' && c.province !== f.province) return false;
  if (f.district !== 'All' && c.district !== f.district) return false;
  if (f.customerType !== 'All' && c.type !== f.customerType) return false;
  if (f.priority !== 'All' && view.priority !== f.priority) return false;
  if (f.repId !== 'All' && view.repId !== f.repId) return false;
  if (f.assignment === 'Assigned' && !view.repId) return false;
  if (f.assignment === 'Unassigned' && view.repId) return false;
  if (f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    const rep = view.repId ? repsById[view.repId] : null;
    const haystack = `${c.name} ${c.code} ${c.district} ${c.province} ${c.type} ${rep?.name ?? ''} ${rep?.employeeId ?? ''}`;
    if (!haystack.toLowerCase().includes(q)) return false;
  }
  return true;
}

/**
 * Re-times a rep's route: leave the depot at 08:00, drive, serve, repeat.
 * Sequence numbers follow the array order so the timeline and the map route
 * can never disagree with the card list.
 */
function retime(repId: string, ordered: Stop[]): Stop[] {
  if (ordered.length === 0) return ordered;
  const depot = depotsById[ordered[0].depotId] ?? depots[0];
  let clock = hhmmToMinutes(DAY_START);
  let from = { lat: depot.lat, lng: depot.lng };

  return ordered.map((stop, index) => {
    const customer = customersById[stop.customerId];
    const legKm = roadKm(from, customer);
    clock += travelMinutes(legKm);
    const plannedStart = minutesToHHMM(clock);
    clock += stop.estimatedMinutes;
    from = { lat: customer.lat, lng: customer.lng };
    return {
      ...stop,
      repId,
      seq: index + 1,
      plannedStart,
      distanceKm: Number(legKm.toFixed(1)),
    };
  });
}

function sortByStrategy(list: Stop[], strategy: OptimizeStrategy, depotId: string): Stop[] {
  const depot = depotsById[depotId] ?? depots[0];
  const copy = [...list];

  switch (strategy) {
    case 'Priority':
      return copy.sort(
        (a, b) =>
          PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
          a.distanceKm - b.distanceKm
      );
    case 'Customer Level':
      return copy.sort(
        (a, b) =>
          TIER_WEIGHT[customersById[a.customerId].tier] -
            TIER_WEIGHT[customersById[b.customerId].tier] ||
          PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]
      );
    case 'Planned Time':
      return copy.sort((a, b) => a.plannedStart.localeCompare(b.plannedStart));
    case 'Sales Territory':
      return copy.sort((a, b) => {
        const ca = customersById[a.customerId];
        const cb = customersById[b.customerId];
        return (
          ca.province.localeCompare(cb.province) ||
          ca.district.localeCompare(cb.district) ||
          a.distanceKm - b.distanceKm
        );
      });
    case 'Distance':
    default: {
      // Nearest-neighbour from the depot — cheap, and it visibly shortens the
      // drawn route, which is the whole point of the demo.
      const remaining = [...copy];
      const ordered: Stop[] = [];
      let cursor = { lat: depot.lat, lng: depot.lng };
      while (remaining.length) {
        let bestIdx = 0;
        let bestKm = Infinity;
        remaining.forEach((s, i) => {
          const km = roadKm(cursor, customersById[s.customerId]);
          if (km < bestKm) {
            bestKm = km;
            bestIdx = i;
          }
        });
        const [next] = remaining.splice(bestIdx, 1);
        ordered.push(next);
        cursor = customersById[next.customerId];
      }
      return ordered;
    }
  }
}

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [stops, setStops] = useState<Stop[]>(() => seedStops.map((s) => ({ ...s })));
  const [filters, setFilters] = useState<PlanningFilters>(DEFAULT_FILTERS);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [strategy, setStrategy] = useState<OptimizeStrategy>('Distance');
  const [optimizing, setOptimizing] = useState(false);
  const [published, setPublished] = useState(false);
  const [lastAssignment, setLastAssignment] = useState<
    { stopId: string; repId: string; at: number } | null
  >(null);

  const setFilter = useCallback(
    <K extends keyof PlanningFilters>(key: K, value: PlanningFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        // District options depend on province, so a province change would
        // otherwise leave an impossible district selected and empty the list.
        if (key === 'province') next.district = 'All';
        return next;
      });
    },
    []
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const stopViews = useMemo<StopView[]>(
    () => stops.map((s) => ({ ...s, customer: customersById[s.customerId] })),
    [stops]
  );

  const filtered = useMemo(
    () => stopViews.filter((v) => matches(v, filters)),
    [stopViews, filters]
  );

  const unassigned = useMemo(() => filtered.filter((s) => !s.repId), [filtered]);
  const assigned = useMemo(() => filtered.filter((s) => s.repId), [filtered]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    (Object.keys(DEFAULT_FILTERS) as Array<keyof PlanningFilters>).forEach((k) => {
      if (k === 'visitDate') return;
      if (k === 'search') {
        if (filters.search.trim()) n += 1;
        return;
      }
      if (filters[k] !== DEFAULT_FILTERS[k]) n += 1;
    });
    return n;
  }, [filters]);

  const assignStop = useCallback((stopId: string, repId: string) => {
    setStops((prev) => {
      const rep = repsById[repId];
      const next = prev.map((s) =>
        s.id === stopId
          ? {
              ...s,
              repId,
              status: s.status === 'Completed' || s.status === 'In Progress' ? s.status : ('Assigned' as const),
            }
          : s
      );
      if (!rep) return next;
      const route = next.filter((s) => s.repId === repId);
      const rest = next.filter((s) => s.repId !== repId);
      return [...rest, ...retime(repId, route)].sort((a, b) => a.id.localeCompare(b.id));
    });
    setPublished(false);
    setLastAssignment({ stopId, repId, at: Date.now() });
  }, []);

  const unassignStop = useCallback((stopId: string) => {
    setStops((prev) =>
      prev.map((s) =>
        s.id === stopId ? { ...s, repId: null, status: 'Unassigned' as const, seq: 0 } : s
      )
    );
    setPublished(false);
  }, []);

  const assignAllVisible = useCallback(
    (repId: string) => {
      const ids = unassigned.map((s) => s.id);
      if (ids.length === 0) return 0;
      setStops((prev) => {
        const next = prev.map((s) =>
          ids.includes(s.id) ? { ...s, repId, status: 'Assigned' as const } : s
        );
        const route = next.filter((s) => s.repId === repId);
        const rest = next.filter((s) => s.repId !== repId);
        return [...rest, ...retime(repId, route)].sort((a, b) => a.id.localeCompare(b.id));
      });
      setPublished(false);
      return ids.length;
    },
    [unassigned]
  );

  const reorderStop = useCallback((repId: string, stopId: string, targetIndex: number) => {
    setStops((prev) => {
      const route = prev.filter((s) => s.repId === repId).sort((a, b) => a.seq - b.seq);
      const from = route.findIndex((s) => s.id === stopId);
      if (from === -1) return prev;
      const [moved] = route.splice(from, 1);
      route.splice(Math.max(0, Math.min(targetIndex, route.length)), 0, moved);
      const rest = prev.filter((s) => s.repId !== repId);
      return [...rest, ...retime(repId, route)].sort((a, b) => a.id.localeCompare(b.id));
    });
    setPublished(false);
  }, []);

  const optimize = useCallback(
    async (repId?: string) => {
      setOptimizing(true);
      // Deliberate pause: the optimisation is theatre, but the manager should
      // see the panel work before the routes snap into their new order.
      await new Promise((resolve) => setTimeout(resolve, 900));
      let touched = 0;
      setStops((prev) => {
        const targetIds = repId
          ? [repId]
          : Array.from(new Set(prev.map((s) => s.repId).filter(Boolean) as string[]));
        let next = [...prev];
        targetIds.forEach((rid) => {
          const route = next.filter((s) => s.repId === rid);
          if (route.length === 0) return;
          touched += route.length;
          const sorted = sortByStrategy(route, strategy, route[0].depotId);
          const rest = next.filter((s) => s.repId !== rid);
          next = [...rest, ...retime(rid, sorted)];
        });
        return next.sort((a, b) => a.id.localeCompare(b.id));
      });
      setOptimizing(false);
      setPublished(false);
      return touched;
    },
    [strategy]
  );

  const publish = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    setPublished(true);
  }, []);

  const routeFor = useCallback(
    (repId: string): RouteSummary => {
      const route = stopViews
        .filter((s) => s.repId === repId)
        .sort((a, b) => a.seq - b.seq);
      const depot = route.length ? depotsById[route[0].depotId] ?? depots[0] : depots[0];
      const distanceKm = routeDistanceKm(depot, route.map((s) => s.customer));
      const drive = travelMinutes(distanceKm);
      const service = route.reduce((sum, s) => sum + s.estimatedMinutes, 0);
      const total = drive + service;
      return {
        repId,
        stops: route,
        distanceKm: Number(distanceKm.toFixed(1)),
        travelMinutes: drive,
        serviceMinutes: service,
        totalMinutes: total,
        finishTime: minutesToHHMM(hhmmToMinutes(DAY_START) + total),
        orderValue: route.reduce((sum, s) => sum + s.orderValue, 0),
      };
    },
    [stopViews]
  );

  const workloadFor = useCallback(
    (repId: string) => {
      const rep = repsById[repId];
      const count = stops.filter((s) => s.repId === repId).length;
      const capacity = rep?.capacity ?? 10;
      return { count, capacity, ratio: capacity ? count / capacity : 0 };
    },
    [stops]
  );

  const kpis = useMemo(() => {
    const total = stops.length;
    const assignedCount = stops.filter((s) => s.repId).length;
    const completed = stops.filter((s) => s.status === 'Completed').length;
    const inProgress = stops.filter((s) => s.status === 'In Progress').length;
    const activeRepIds = new Set(stops.filter((s) => s.repId).map((s) => s.repId as string));
    const totalDistance = stops.reduce((sum, s) => sum + s.distanceKm, 0);
    const plannedMinutes = stops.reduce((sum, s) => sum + s.estimatedMinutes, 0);
    return {
      total,
      assigned: assignedCount,
      unassigned: total - assignedCount,
      completed,
      inProgress,
      repsWorking: activeRepIds.size,
      coverage: total ? Math.round((assignedCount / total) * 100) : 0,
      avgDistance: total ? Number((totalDistance / total).toFixed(1)) : 0,
      totalDistance: Number(totalDistance.toFixed(0)),
      plannedMinutes,
      orderValue: stops.reduce((sum, s) => sum + s.orderValue, 0),
    };
  }, [stops]);

  const selectedStop = useMemo(
    () => stopViews.find((s) => s.id === selectedStopId) ?? null,
    [stopViews, selectedStopId]
  );

  const value = useMemo<PlanningContextValue>(
    () => ({
      stops,
      stopViews,
      filtered,
      unassigned,
      assigned,
      reps: salesReps,
      filters,
      setFilter,
      resetFilters,
      activeFilterCount,
      selectedStopId,
      selectStop: setSelectedStopId,
      selectedStop,
      selectedRepId,
      selectRep: setSelectedRepId,
      summaryOpen,
      setSummaryOpen,
      assignStop,
      unassignStop,
      assignAllVisible,
      reorderStop,
      strategy,
      setStrategy,
      optimizing,
      optimize,
      published,
      publish,
      routeFor,
      workloadFor,
      kpis,
      lastAssignment,
    }),
    [
      stops, stopViews, filtered, unassigned, assigned, filters, setFilter, resetFilters,
      activeFilterCount, selectedStopId, selectedStop, selectedRepId, summaryOpen,
      assignStop, unassignStop, assignAllVisible, reorderStop, strategy, optimizing,
      optimize, published, publish, routeFor, workloadFor, kpis, lastAssignment,
    ]
  );

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning(): PlanningContextValue {
  const ctx = useContext(PlanningContext);
  if (!ctx) throw new Error('usePlanning must be used within a PlanningProvider');
  return ctx;
}
