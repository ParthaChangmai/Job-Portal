import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="rounded-2xl bg-primary/10 p-2 text-primary">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="font-display text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </div>
    </Card>
  );
}
