import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints } from "../../services/complaintService";
import ComplaintMap from "../../components/maps/ComplaintMap";
import MapFilters from "../../components/maps/MapFilters";
import StatsGrid from "../../components/charts/StatsGrid";
import MonthlyTrendChart from "../../components/charts/MonthlyTrendChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import PriorityPieChart from "../../components/charts/PriorityPieChart";
import {
  getStats,
  getMonthlyTrend,
  getStatusDistribution,
  getPriorityDistribution,
} from "../../services/analyticsService";

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [priorityDist, setPriorityDist] = useState([]);

  const load = async (f = {}) => {
    try {
      const { data } = await getComplaints(f);
      setComplaints(data);
    } catch {
      setComplaints([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const [s, m, st, p] = await Promise.all([
        getStats(),
        getMonthlyTrend(),
        getStatusDistribution(),
        getPriorityDistribution(),
      ]);
      setStats(s.data);
      setMonthlyTrend(m.data);
      setStatusDist(st.data);
      setPriorityDist(p.data);
    } catch {}
  };

  useEffect(() => {
    load();
    loadAnalytics();
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Citizen Dashboard</h2>
        <Link
          to="/citizen/new"
          className="btn"
          style={{ textDecoration: "none" }}
        >
          + New Complaint
        </Link>
      </div>

      <StatsGrid stats={stats} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <MonthlyTrendChart data={monthlyTrend} />
        <StatusPieChart data={statusDist} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <PriorityPieChart data={priorityDist} />
      </div>

      <ComplaintMap complaints={complaints} height={350} />
      <MapFilters
        filters={filters}
        onChange={setFilters}
        onApply={() => load(filters)}
      />

      <h3 style={{ marginBottom: 12, marginTop: 16 }}>My Complaints</h3>
      {complaints.length === 0 && (
        <p style={{ color: "#64748b" }}>No complaints yet.</p>
      )}
      {complaints.map((c) => (
        <div key={c._id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{c.complaintId}</strong>
            <span className={`badge badge-${c.status}`}>
              {c.status?.toUpperCase()}
            </span>
          </div>
          <p style={{ marginTop: 6, fontSize: 14, color: "#64748b" }}>
            {c.title}
          </p>
        </div>
      ))}
    </div>
  );
}
