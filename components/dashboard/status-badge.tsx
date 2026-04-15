import { Badge } from "@/components/ui/badge";
import { seniorityLabels, statusLabels, workStyleLabels } from "@/lib/constants";
import type { JobStatus, SeniorityLabel, WorkStyleLabel } from "@/types";

export function StatusBadge({ status }: { status: JobStatus }) {
  const variant =
    status === "OFFER"
      ? "success"
      : status === "REJECTED"
        ? "danger"
        : status === "INTERVIEWING"
          ? "warning"
          : status === "APPLIED"
            ? "primary"
            : "neutral";

  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}

export function SeniorityBadge({ seniority }: { seniority: SeniorityLabel }) {
  return <Badge variant="primary">{seniorityLabels[seniority]}</Badge>;
}

export function WorkStyleBadge({ workStyle }: { workStyle: WorkStyleLabel }) {
  return <Badge variant="neutral">{workStyleLabels[workStyle]}</Badge>;
}
