/**
 * Deterministic helpers shared by every mock repository.
 *
 * All demo data is generated from a seed rather than `Math.random`, so the
 * server render and the client hydration produce identical markup. A mismatch
 * here surfaces as a hydration error on every page.
 */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: number) {
  const rand = mulberry32(seed);
  return {
    rand,
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)],
    int: (min: number, max: number) => min + Math.floor(rand() * (max - min + 1)),
    float: (min: number, max: number) => min + rand() * (max - min),
    chance: (p: number) => rand() < p,
    /** Weighted pick: `[['Active', 6], ['Inactive', 1]]`. */
    weighted: <T,>(entries: ReadonlyArray<readonly [T, number]>): T => {
      const total = entries.reduce((sum, [, w]) => sum + w, 0);
      let roll = rand() * total;
      for (const [value, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return value;
      }
      return entries[entries.length - 1][0];
    },
  };
}

/** The date the demo data is anchored to, so "today" is stable. */
export const TODAY = new Date(Date.UTC(2026, 7, 7));

export function isoDate(offsetDays: number, from: Date = TODAY): string {
  return new Date(from.getTime() + offsetDays * 86400000).toISOString().slice(0, 10);
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}k`;
  }
  return `$${value.toLocaleString('en-US')}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "in 3 days" / "5 days ago" — the phrasing follow-up lists actually need. */
export function relativeDays(iso: string | null): { label: string; days: number } | null {
  if (!iso) return null;
  const days = Math.round(
    (new Date(`${iso}T00:00:00Z`).getTime() - TODAY.getTime()) / 86400000
  );
  if (days === 0) return { label: 'Today', days };
  if (days === 1) return { label: 'Tomorrow', days };
  if (days === -1) return { label: 'Yesterday', days };
  return {
    label: days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`,
    days,
  };
}
