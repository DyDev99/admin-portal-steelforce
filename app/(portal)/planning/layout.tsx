import { PlanningProvider } from '@/lib/planning/store';
import { PlanningNav } from '@/components/planning/planning-nav';
import { StopDetailDrawer } from '@/components/planning/stop-detail-drawer';
import { PlanSummaryDrawer } from '@/components/planning/plan-summary-drawer';

/**
 * One provider for the whole module: assignments made on the board are still
 * there when the manager moves to the map or the reports tab.
 */
export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlanningProvider>
      <PlanningNav />
      {children}
      <StopDetailDrawer />
      <PlanSummaryDrawer />
    </PlanningProvider>
  );
}
