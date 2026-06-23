import React, { useEffect, useState } from "react";
import ComplaintMap from "../../components/maps/ComplaintMap";
import MapFilters from "../../components/maps/MapFilters";
import StatsGrid from "../../components/charts/StatsGrid";
import MonthlyTrendChart from "../../components/charts/MonthlyTrendChart";
import DeptDistribution from "../../components/charts/DeptDistribution";
import StatusPieChart from "../../components/charts/StatusPieChart";
import PriorityPieChart from "../../components/charts/PriorityPieChart";
import WorkerPerfChart from "../../components/charts/WorkerPerfChart";
import { getComplaints } from "../../services/complaintService";
import {
  getStats,
  getMonthlyTrend,
  getDepartmentDistribution,
  getStatusDistribution,
  getPriorityDistribution,
  getWorkerPerformance,
} from "../../services/analyticsService";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [deptDist, setDeptDist] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [priorityDist, setPriorityDist] = useState([]);
  const [workerPerf, setWorkerPerf] = useState([]);

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
      const [s, m, d, st, p, w] = await Promise.all([
        getStats(),
        getMonthlyTrend(),
        getDepartmentDistribution(),
        getStatusDistribution(),
        getPriorityDistribution(),
        getWorkerPerformance(),
      ]);
      setStats(s.data);
      setMonthlyTrend(m.data);
      setDeptDist(d.data);
      setStatusDist(st.data);
      setPriorityDist(p.data);
      setWorkerPerf(w.data);
    } catch {
      // analytics silently fail
    }
  };

  useEffect(() => {
    load();
    loadAnalytics();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Admin Dashboard</h2>

      <StatsGrid stats={stats} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <MonthlyTrendChart data={monthlyTrend} />
        <DeptDistribution data={deptDist} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <StatusPieChart data={statusDist} />
        <PriorityPieChart data={priorityDist} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <WorkerPerfChart data={workerPerf} />
      </div>

      <ComplaintMap complaints={complaints} height={400} />
      <MapFilters filters={filters} onChange={setFilters} onApply={() => load(filters)} />
    </div>
  );
}
