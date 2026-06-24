import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DeptDistribution({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>
          Department Distribution
        </h4>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>No data available</p>
      </div>
    );
  }
  return (
    <div className="card" style={{ padding: 16 }}>
      <h4 style={{ marginBottom: 12, fontSize: 14 }}>
        Department Distribution
      </h4>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            width={90}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
