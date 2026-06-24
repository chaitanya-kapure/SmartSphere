import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  pending: "#fb923c",
  assigned: "#38bdf8",
  in_progress: "#3b82f6",
  verification: "#a78bfa",
  resolved: "#22c55e",
  rejected: "#ef4444",
  reopened: "#f97316",
};

const LABELS = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  verification: "Verification",
  resolved: "Resolved",
  rejected: "Rejected",
  reopened: "Reopened",
};

export default function StatusPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>Status Distribution</h4>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>No data available</p>
      </div>
    );
  }
  const chartData = data.map((d) => ({
    name: LABELS[d.status] || d.status,
    value: d.count,
  }));

  return (
    <div className="card" style={{ padding: 16 }}>
      <h4 style={{ marginBottom: 12, fontSize: 14 }}>Status Distribution</h4>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[data.find((d) => (LABELS[d.status] || d.status) === entry.name)?.status] || "#94a3b8"}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
