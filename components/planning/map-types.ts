import type { Depot, SalesRep, StopView } from '@/lib/planning/types';

/**
 * Shared contract for both basemaps (Google and the offline vector map), so
 * `MapCanvas` can swap one for the other without the caller knowing.
 */
export interface StopMapProps {
  stops: StopView[];
  depots?: Depot[];
  reps?: SalesRep[];
  /** Ordered stops for the highlighted route; drawn as an animated polyline. */
  routeStops?: StopView[];
  routeDepot?: Depot | null;
  routeColor?: string;
  selectedStopId?: string | null;
  onSelectStop?: (stop: StopView) => void;
  onOpenStop?: (stop: StopView) => void;
  onAssignStop?: (stop: StopView) => void;
  className?: string;
  /** Caps how many markers render at once so large plans stay smooth. */
  maxMarkers?: number;
  colorBy?: 'priority' | 'status';
  /** Raised when a basemap fails to initialise so the caller can fall back. */
  onLoadError?: (error: Error) => void;
}
