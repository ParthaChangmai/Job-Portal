"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card } from "@/components/ui/card";

const statusColors = ["#0f766e", "#f59e0b", "#0284c7", "#16a34a", "#ef4444", "#64748b"];

export function AnalyticsCharts({
  charts
}: {
  charts: {
    applicationsByWeek: Array<{ week: string; applications: number }>;
    jobsByStatus: Array<{ status: string; value: number }>;
    topCompanies: Array<{ company: string; count: number }>;
    topSkills: Array<{ skill: string; count: number }>;
  };
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <h3 className="font-display text-xl font-semibold">Applications by week</h3>
        <p className="mt-1 text-sm text-muted-foreground">Track consistency over the last eight weeks.</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.applicationsByWeek}>
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="applications" fill="#0f766e" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-xl font-semibold">Jobs by status</h3>
        <p className="mt-1 text-sm text-muted-foreground">See how your pipeline is distributed right now.</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={charts.jobsByStatus} dataKey="value" nameKey="status" innerRadius={60} outerRadius={96}>
                {charts.jobsByStatus.map((entry, index) => (
                  <Cell key={entry.status} fill={statusColors[index % statusColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-xl font-semibold">Top companies</h3>
        <p className="mt-1 text-sm text-muted-foreground">Where most of your effort is going.</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={charts.topCompanies}>
              <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="company" stroke="#94a3b8" fontSize={12} width={110} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 12, 12, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-xl font-semibold">Top extracted skills</h3>
        <p className="mt-1 text-sm text-muted-foreground">The capabilities showing up most across your saved roles.</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={charts.topSkills}>
              <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="skill" stroke="#94a3b8" fontSize={12} width={110} />
              <Tooltip />
              <Bar dataKey="count" fill="#0284c7" radius={[0, 12, 12, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
