"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function InsightsPanel({ analytics }: { analytics: any }) {
  const byDate: Record<string, number> = {};
  (analytics.pageViews || []).forEach((pv: any) => {
    byDate[pv.date] = (byDate[pv.date] || 0) + pv.count;
  });
  const labels = Object.keys(byDate).sort();
  const values = labels.map((d) => byDate[d]);

  const data = {
    labels,
    datasets: [
      {
        label: "Page views",
        data: values,
        borderColor: "#0096D6",
        backgroundColor: "rgba(0,150,214,0.15)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const stats = [
    { label: "Messages", value: analytics.totalMessages },
    { label: "Active subscribers", value: analytics.totalSubscribers },
    { label: "Published posts", value: analytics.totalPosts },
    { label: "Reactions", value: Object.values(analytics.reactionTotals || {}).reduce((a: any, b: any) => a + b, 0) as number },
  ];

  return (
    <div>
      <h1 className="adm-h1">Insights</h1>
      <p className="adm-sub">Traffic and engagement over the last 30 days.</p>
      <div className="adm-stat-grid">
        {stats.map((s) => (
          <div className="adm-stat-card" key={s.label}>
            <div className="adm-stat-value">{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="adm-panel" style={{ padding: 20 }}>
        {labels.length === 0 ? (
          <p style={{ color: "var(--adm-muted)", fontSize: 13 }}>No page view data recorded yet.</p>
        ) : (
          <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        )}
      </div>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
