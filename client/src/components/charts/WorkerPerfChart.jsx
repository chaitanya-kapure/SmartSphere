import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function WorkerPerfChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>
          Worker Performance
        </h4>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>No data available</p>
      </div>
    );
  }
  return (
    <div className="card" style={{ padding: 16 }}>
      <h4 style={{ marginBottom: 12, fontSize: 14 }}>
        Worker Performance (Resolved)
      </h4>
      <ResponsiveContainer
        width="100%"
        height={Math.max(200, data.length * 50)}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            width={90}
          />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="resolved"
            fill="#22c55e"
            name="Resolved"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="avgTime"
            fill="#a855f7"
            name="Avg Hours"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
