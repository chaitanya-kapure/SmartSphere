import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  low: "#22c55e",
  medium: "#fb923c",
  high: "#ef4444",
};

const LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function PriorityPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>
          Priority Distribution
        </h4>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>No data available</p>
      </div>
    );
  }
  const chartData = data.map((d) => ({
    name: LABELS[d.priority] || d.priority,
    value: d.count,
  }));

  return (
    <div className="card" style={{ padding: 16 }}>
      <h4 style={{ marginBottom: 12, fontSize: 14 }}>
        Priority Distribution
      </h4>
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
                fill={
                  COLORS[
                    data.find(
                      (d) => (LABELS[d.priority] || d.priority) === entry.name
                    )?.priority
                  ] || "#94a3b8"
                }
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
