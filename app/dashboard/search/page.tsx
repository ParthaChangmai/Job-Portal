import { SearchPanel } from "@/components/dashboard/search-panel";
import { PageHeader } from "@/components/ui/page-header";

export default function DashboardSearchPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Job Search"
        title="Find roles worth tracking"
        description="Search live listings securely through a server route, then save the best opportunities straight into your personal tracker."
      />
      <SearchPanel />
    </div>
  );
}
