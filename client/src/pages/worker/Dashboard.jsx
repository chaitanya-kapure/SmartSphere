import React, { useEffect, useState } from "react";
import { getComplaints, updateStatus, uploadImage } from "../../services/complaintService";
import ComplaintMap from "../../components/maps/ComplaintMap";
import StatsGrid from "../../components/charts/StatsGrid";
import StatusPieChart from "../../components/charts/StatusPieChart";
import PriorityPieChart from "../../components/charts/PriorityPieChart";
import {
  getStats,
  getStatusDistribution,
  getPriorityDistribution,
} from "../../services/analyticsService";

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [proofs, setProofs] = useState({});
  const [uploading, setUploading] = useState({});
  const [stats, setStats] = useState(null);
  const [statusDist, setStatusDist] = useState([]);
  const [priorityDist, setPriorityDist] = useState([]);

  const load = async () => {
    try {
      const { data } = await getComplaints();
      setTasks(data);
    } catch {
      setTasks([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const [s, st, p] = await Promise.all([
        getStats(),
        getStatusDistribution(),
        getPriorityDistribution(),
      ]);
      setStats(s.data);
      setStatusDist(st.data);
      setPriorityDist(p.data);
    } catch {}
  };

  useEffect(() => {
    load();
    loadAnalytics();
  }, []);

  const handleProofUpload = async (complaintId, file) => {
    setUploading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      const { data } = await uploadImage(file, "proof", complaintId);
      setProofs((prev) => ({
        ...prev,
        [complaintId]: [
          ...(prev[complaintId] || []),
          { url: data.url, publicId: data.publicId },
        ],
      }));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const body = { status };
      if (proofs[id] && proofs[id].length > 0) {
        body.proofImages = proofs[id];
      }
      await updateStatus(id, body);
      setProofs((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Status update failed");
    }
  };

  const nextStatus = (current) => {
    const map = { assigned: "in_progress", in_progress: "verification" };
    return map[current];
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Worker Dashboard</h2>

      <StatsGrid stats={stats} />

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

      <ComplaintMap complaints={tasks} height={350} />
      <h3 style={{ marginTop: 16, marginBottom: 12 }}>My Tasks</h3>
      {tasks.length === 0 && (
        <p style={{ color: "#94a3b8" }}>No tasks assigned.</p>
      )}
      {tasks.map((t) => (
        <div key={t._id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{t.complaintId}</strong>
            <span className={`badge badge-${t.status}`}>
              {t.status?.toUpperCase()}
            </span>
          </div>
          <p style={{ marginTop: 6, fontSize: 14, color: "#94a3b8" }}>
            {t.title}
          </p>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {(t.status === "assigned" || t.status === "in_progress") && (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files[0])
                      handleProofUpload(t._id, e.target.files[0]);
                  }}
                  style={{ fontSize: 12, color: "#94a3b8" }}
                />
                {uploading[t._id] && (
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    Uploading...
                  </span>
                )}
                {proofs[t._id]?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {proofs[t._id].map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt="proof"
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                      />
                    ))}
                  </div>
                )}
                {nextStatus(t.status) === "verification" &&
                  (!proofs[t._id] || proofs[t._id].length === 0) && (
                    <span style={{ fontSize: 12, color: "#ef4444" }}>
                      Proof image is required.
                    </span>
                  )}
                <button
                  className="btn btn-sm"
                  disabled={
                    (nextStatus(t.status) === "verification" &&
                      (!proofs[t._id] || proofs[t._id].length === 0))
                  }
                  onClick={() =>
                    handleStatusUpdate(t._id, nextStatus(t.status))
                  }
                >
                  Mark{" "}
                  {nextStatus(t.status) === "in_progress"
                    ? "In Progress"
                    : "Complete"}
                </button>
              </>
            )}
            {t.status === "rejected" && t.rejectionRemark && (
              <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>
                Rejected: {t.rejectionRemark}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
