import React from "react";

export default function StatCard({ label, value, color, icon, suffix }) {
  return (
    <div
      className="card"
      style={{
        textAlign: "center",
        padding: "20px 12px",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <p style={{ fontSize: 28, fontWeight: "bold", color, margin: 0 }}>
        {value ?? "-"}
        {suffix && (
          <span style={{ fontSize: 14, color: "#94a3b8", marginLeft: 4 }}>
            {suffix}
          </span>
        )}
      </p>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
        {label}
      </p>
    </div>
  );
}
