import React from "react";
import StatCard from "./StatCard";

export default function StatsGrid({ stats }) {
  if (!stats) return null;
  return (
    <div
      className="grid-2"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <StatCard
        label="Total Complaints"
        value={stats.total}
        color="#6366f1"
        icon={"\u{1F4CB}"}
      />
      <StatCard
        label="Pending"
        value={stats.pending}
        color="#fb923c"
        icon={"\u{23F3}"}
      />
      <StatCard
        label="In Progress"
        value={stats.inProgress}
        color="#3b82f6"
        icon={"\u{1F6A7}"}
      />
      <StatCard
        label="Resolved"
        value={stats.resolved}
        color="#22c55e"
        icon={"\u{2705}"}
      />
      <StatCard
        label="Overdue"
        value={stats.overdue}
        color="#ef4444"
        icon={"\u{26A0}\uFE0F"}
      />
      <StatCard
        label="Avg Resolution"
        value={stats.avgResolutionTime}
        color="#a855f7"
        icon={"\u{23F1}\uFE0F"}
        suffix="hrs"
      />
    </div>
  );
}
