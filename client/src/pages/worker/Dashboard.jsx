import React, { useEffect, useState } from "react";
import { getComplaints, updateStatus, uploadImage } from "../../services/complaintService";
import ComplaintMap from "../../components/maps/ComplaintMap";

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [proofs, setProofs] = useState({});
  const [uploading, setUploading] = useState({});

  const load = async () => {
    try {
      const { data } = await getComplaints();
      setTasks(data);
    } catch {
      setTasks([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleProofUpload = async (complaintId, file) => {
    setUploading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      const { data } = await uploadImage(file, "proof", complaintId);
      setProofs((prev) => ({
        ...prev,
        [complaintId]: [...(prev[complaintId] || []), { url: data.url, publicId: data.publicId }],
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
      <ComplaintMap complaints={tasks} height={350} />
      <h3 style={{ marginTop: 16, marginBottom: 12 }}>My Tasks</h3>
      {tasks.length === 0 && <p style={{ color: "#94a3b8" }}>No tasks assigned.</p>}
      {tasks.map((t) => (
        <div key={t._id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{t.complaintId}</strong>
            <span className={`badge badge-${t.status}`}>{t.status?.toUpperCase()}</span>
          </div>
          <p style={{ marginTop: 6, fontSize: 14, color: "#94a3b8" }}>{t.title}</p>

          <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
            {(t.status === "assigned" || t.status === "in_progress") && (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files[0]) handleProofUpload(t._id, e.target.files[0]);
                  }}
                  style={{ fontSize: 12, color: "#94a3b8" }}
                />
                {uploading[t._id] && <span style={{ fontSize: 12, color: "#94a3b8" }}>Uploading...</span>}
                {proofs[t._id]?.length > 0 && (
                  <span style={{ fontSize: 12, color: "#22c55e" }}>{proofs[t._id].length} uploaded</span>
                )}
                <button className="btn btn-sm" onClick={() => handleStatusUpdate(t._id, nextStatus(t.status))}>
                  Mark {nextStatus(t.status) === "in_progress" ? "In Progress" : "Verification"}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
