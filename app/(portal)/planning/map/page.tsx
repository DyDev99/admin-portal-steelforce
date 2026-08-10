'use client';

import { PageBody } from '@/components/shared/page-layout';
import { Card } from '@/components/ui/card';
import { FilterBar } from '@/components/planning/filter-bar';
import { MapCanvas } from '@/components/planning/map-canvas';
import { RepAvatar } from '@/components/planning/rep-avatar';
import { SectionHeader, EmptyState } from '@/components/shared/section-header';
import { StatusBadge, MetaChip } from '@/components/planning/status-badge';
import { ToggleChip } from '@/components/shared/filter-chip';
import { RouteTimeline } from '@/components/planning/route-timeline';
import { usePlanning } from '@/lib/planning/store';
import { depots, depotsById } from '@/lib/planning/demo-data';
import { formatKm, formatTime } from '@/lib/planning/geo';
import { CUSTOMER_TYPE_ICON, PRIORITY_TONE, repColor } from '@/lib/planning/tokens';
import { Flag, Layers, Route, SearchX, Users, Warehouse } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function LiveMapPage() {
  const { filtered, reps, selectedRepId, selectRep, selectStop, selectedStopId, routeFor } =
    usePlanning();
  const [colorBy, setColorBy] = useState<'priority' | 'status'>('priority');
  const [showAllReps, setShowAllReps] = useState(true);

  const selectedRep = selectedRepId ? reps.find((r) => r.id === selectedRepId) ?? null : null;
  const route = selectedRepId ? routeFor(selectedRepId) : null;
  const routeDepot = route?.stops.length ? depotsById[route.stops[0].depotId] : depots[0];

  const activeReps = useMemo(
    () => (selectedRep ? [selectedRep] : showAllReps ? reps.filter((r) => r.online) : []),
    [selectedRep, showAllReps, reps]
  );

  const listed = useMemo(() => filtered.slice(0, 40), [filtered]);

  return (
    <PageBody>
      <FilterBar />

      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-4">
        {/* Left rail */}
        <div className="min-w-0 space-y-4">
          <Card className="p-6 rounded-card border-surface card-shadow">
            <SectionHeader title="Map layers" icon={Layers} />
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 mb-3">
              <ToggleChip label="By priority" active={colorBy === 'priority'} onClick={() => setColorBy('priority')} />
              <ToggleChip label="By status" active={colorBy === 'status'} onClick={() => setColorBy('status')} />
            </div>
            <button
              onClick={() => setShowAllReps((v) => !v)}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-colors ${
                showAllReps ? 'border-primary/40 bg-primary/5 text-primary' : 'border-surface text-muted-foreground'
              }`}
            >
              <Users size={14} />
              <span className="text-[12px] font-medium flex-1">Show live rep positions</span>
              <span className="text-[10.5px] tabular-nums">{reps.filter((r) => r.online).length}</span>
            </button>
            <div className="flex items-center gap-2 p-2.5 mt-1.5 rounded-xl border border-surface">
              <Warehouse size={14} className="text-muted-foreground" />
              <span className="text-[12px] font-medium text-muted-foreground flex-1">Depots</span>
              <span className="text-[10.5px] text-muted-foreground tabular-nums">{depots.length}</span>
            </div>
          </Card>

          <Card className="p-6 rounded-card border-surface card-shadow">
            <SectionHeader
              title="Plotted stops"
              subtitle="Click to focus the marker"
              icon={Flag}
              count={filtered.length}
            />
            <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
              {listed.length === 0 && (
                <EmptyState icon={SearchX} title="Nothing to plot" hint="Adjust the filters to show stops." />
              )}
              {listed.map((stop) => {
                const Icon = CUSTOMER_TYPE_ICON[stop.customer.type];
                const tone = PRIORITY_TONE[stop.priority];
                const active = selectedStopId === stop.id;
                return (
                  <button
                    key={stop.id}
                    onClick={() => selectStop(stop.id)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors text-left ${
                      active ? 'bg-primary/5' : 'hover:bg-accent/40'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tone.hex}1A` }}
                    >
                      <Icon size={12} style={{ color: tone.hex }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11.5px] font-medium text-main truncate">
                        {stop.customer.name}
                      </span>
                      <span className="block text-[10px] text-muted-foreground truncate">
                        {formatTime(stop.plannedStart)} · {formatKm(stop.distanceKm)} · {stop.customer.district}
                      </span>
                    </span>
                    <StatusBadge status={stop.status} />
                  </button>
                );
              })}
              {filtered.length > listed.length && (
                <p className="text-[10.5px] text-muted-foreground text-center py-2">
                  Showing the first {listed.length} of {filtered.length} stops
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Map + route */}
        <div className="min-w-0 space-y-4">
          <MapCanvas
            stops={filtered}
            depots={depots}
            reps={activeReps}
            routeStops={route?.stops ?? []}
            routeDepot={routeDepot}
            routeColor={selectedRep ? repColor(selectedRep.avatarHue) : '#2563EB'}
            selectedStopId={selectedStopId}
            colorBy={colorBy}
            onSelectStop={(stop) => selectStop(stop.id)}
            onOpenStop={(stop) => selectStop(stop.id)}
            className="h-[520px] sm:h-[620px]"
          />

          {/* Rep switcher */}
          <Card className="p-6 rounded-card border-surface card-shadow">
            <SectionHeader
              title="Highlight a route"
              subtitle="Draw one rep's day across the map"
              icon={Route}
            />
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {reps
                .filter((r) => routeFor(r.id).stops.length > 0)
                .map((rep) => {
                  const active = selectedRepId === rep.id;
                  return (
                    <button
                      key={rep.id}
                      onClick={() => selectRep(active ? null : rep.id)}
                      className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                        active
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-surface hover:bg-accent/40'
                      }`}
                    >
                      <RepAvatar rep={rep} size="sm" showStatus={false} />
                      <span className="text-left">
                        <span className="block text-[11.5px] font-medium text-main">{rep.name}</span>
                        <span className="block text-[9.5px] text-muted-foreground">
                          {routeFor(rep.id).stops.length} stops
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>

            {selectedRep && route && route.stops.length > 0 && (
              <div className="mt-4 pt-4 border-t border-surface">
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <MetaChip label={selectedRep.team} />
                  <MetaChip label={selectedRep.salesOrg} />
                  <MetaChip label={`${formatKm(route.distanceKm)} route`} />
                  <MetaChip label={`Finishes ${formatTime(route.finishTime)}`} />
                </div>
                <div className="max-h-[320px] overflow-y-auto pr-1">
                  <RouteTimeline
                    stops={route.stops}
                    depot={routeDepot}
                    accent={repColor(selectedRep.avatarHue)}
                    selectedStopId={selectedStopId}
                    onSelect={(stop) => selectStop(stop.id)}
                    compact
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageBody>
  );
}
