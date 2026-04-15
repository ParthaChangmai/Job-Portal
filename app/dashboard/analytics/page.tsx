import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/session";
import { getAnalyticsForUser } from "@/lib/services/analytics";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const data = await getAnalyticsForUser(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Measure how your search is performing"
        description="Use weekly trends, status breakdowns, and skill concentration to decide where to focus your time."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total saved jobs" value={data.metrics.totalSavedJobs} hint="Every role currently stored in your personal tracker." />
        <MetricCard label="Interviews" value={data.metrics.interviews} hint="Roles that have reached screening or interview stages." />
        <MetricCard label="Offers" value={data.metrics.offers} hint={`${data.metrics.rejectionRate}% rejection rate across active applications.`} />
      </div>

      <AnalyticsCharts charts={data.charts} />
    </div>
  );
}
