import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../../components/maps/LocationPicker";
import { createComplaint, uploadImage } from "../../services/complaintService";

export default function NewComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError("Maximum 5 images");
      return;
    }
    setUploading(true);
    setError("");
    const uploaded = [];
    for (const file of files) {
      try {
        const { data } = await uploadImage(file, "complaint");
        uploaded.push({ url: data.url, publicId: data.publicId });
      } catch {
        setError("Image upload failed");
      }
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleLocationSelect = ({ lat, lng, address, city, state, pincode }) => {
    setLocation({ coordinates: [lng, lat] });
    setForm((prev) => ({ ...prev, address, city, state, pincode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setError("Title and description are required");
      return;
    }
    if (!location || !form.address) {
      setError("Please select your location using the button above");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createComplaint({
        ...form,
        location: { type: "Point", coordinates: location.coordinates },
        images,
      });
      navigate("/citizen");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>New Complaint</h2>
      {error && (
        <div
          style={{
            background: "#450a0a",
            border: "1px solid #ef444440",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 12,
            color: "#fca5a5",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}
      <div className="card">
        <input
          className="input"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="input"
          style={{ minHeight: 100, resize: "vertical" }}
          placeholder="Describe the issue in detail..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="input"
          placeholder="Category (e.g., Electrical, Sanitation)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 10,
            marginTop: 4,
          }}
        >
          Location
        </p>
        <LocationPicker onSelect={handleLocationSelect} />

        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          Images (max 5)
        </p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ marginBottom: 8, color: "#94a3b8", fontSize: 13 }}
        />
        {uploading && <p style={{ fontSize: 12, color: "#94a3b8" }}>Uploading...</p>}
        {images.length > 0 && (
          <p style={{ fontSize: 12, color: "#22c55e", marginBottom: 8 }}>
            {images.length} image(s) uploaded
          </p>
        )}

        <button
          className="btn"
          style={{
            width: "100%",
            marginTop: 12,
            padding: "14px 20px",
            fontSize: 16,
            fontWeight: 600,
          }}
          onClick={handleSubmit}
          disabled={submitting || uploading}
        >
          {submitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>
    </div>
  );
}
