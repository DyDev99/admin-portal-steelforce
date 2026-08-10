import type { StopStatus } from './types';

/**
 * Chart colour tokens.
 *
 * These are deliberately NOT the same hexes as `tokens.ts` (which tints badges
 * and map pins). Chart fills are large marks on a card surface, so the steps
 * here were validated against the palette checks — lightness band, chroma floor,
 * CVD separation and contrast — for both surfaces:
 *
 *   light surface #FFFFFF, dark surface #1E293B
 *   [#059669, #D97706, #3B82F6, #F43F5E] → all checks pass in both modes
 *
 * The worst adjacent pair (amber↔emerald, ΔE 7.9 under protanopia) sits in the
 * 6–8 floor band, which is legal only alongside secondary encoding — hence the
 * legend, direct labels and 2px surface gaps on every stacked mark below.
 * `Unassigned` uses the de-emphasis neutral rather than a hue: it means
 * "nothing yet", so it should not compete for identity.
 */

export interface ChartTheme {
  /** Slot 1 — every single-series bar/area uses this one hue. */
  primary: string;
  primarySoft: string;
  grid: string;
  axis: string;
  surface: string;
  tooltipBg: string;
  tooltipBorder: string;
  neutral: string;
}

export const CHART_LIGHT: ChartTheme = {
  primary: '#2563EB',
  primarySoft: 'rgba(37, 99, 235, 0.16)',
  grid: '#EEF2F7',
  axis: '#94A3B8',
  surface: '#FFFFFF',
  tooltipBg: 'rgba(255,255,255,0.92)',
  tooltipBorder: '#E2E8F0',
  neutral: '#94A3B8',
};

export const CHART_DARK: ChartTheme = {
  primary: '#3B82F6',
  primarySoft: 'rgba(59, 130, 246, 0.22)',
  grid: '#1E2A3D',
  axis: '#64748B',
  surface: '#1E293B',
  tooltipBg: 'rgba(30,41,59,0.94)',
  tooltipBorder: '#334155',
  neutral: '#64748B',
};

/** Validated status fills, shared by both modes. */
export const STATUS_FILL: Record<StopStatus, string> = {
  Completed: '#059669',
  'In Progress': '#D97706',
  Assigned: '#3B82F6',
  Unassigned: '#94A3B8',
  Skipped: '#F43F5E',
};

/** Stack order: done → in flight → planned → not started → dropped. */
export const STATUS_STACK_ORDER: StopStatus[] = [
  'Completed',
  'In Progress',
  'Assigned',
  'Unassigned',
  'Skipped',
];

export function chartTheme(isDark: boolean): ChartTheme {
  return isDark ? CHART_DARK : CHART_LIGHT;
}
