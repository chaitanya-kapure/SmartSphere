import React from "react";

export default function MapFilters({ filters, onChange, onApply }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "flex-end",
        marginBottom: 16,
      }}
    >
      <div>
        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
          Status
        </label>
        <select
          className="input"
          style={{ width: 140, marginBottom: 0 }}
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="verification">Verification</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
          Priority
        </label>
        <select
          className="input"
          style={{ width: 140, marginBottom: 0 }}
          value={filters.priority || ""}
          onChange={(e) => handleChange("priority", e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button className="btn btn-sm" onClick={onApply}>
        Apply Filters
      </button>

      <button
        className="btn btn-sm btn-danger"
        onClick={() => {
          onChange({});
          setTimeout(onApply, 0);
        }}
      >
        Clear
      </button>
    </div>
  );
}
