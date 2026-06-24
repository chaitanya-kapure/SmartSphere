import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

const statusIcons = {
  pending: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-orange.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  assigned: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  in_progress: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  resolved: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ComplaintMap({ complaints = [], height = 500 }) {
  const hasComplaints = complaints.some(
    (c) => c.location && c.location.coordinates && c.location.coordinates[0] !== 0
  );

  const validComplaints = complaints.filter(
    (c) => c.location && c.location.coordinates && c.location.coordinates[0] !== 0
  );

  return (
    <div style={{ height, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasComplaints && (
          <MarkerClusterGroup chunkedLoading>
            {validComplaints.map((c) => (
              <Marker
                key={c._id || c.complaintId}
                position={[c.location.coordinates[1], c.location.coordinates[0]]}
                icon={statusIcons[c.status] || defaultIcon}
              >
                <Popup>
                  <div style={{ fontFamily: "Segoe UI", fontSize: 13, color: "#333", minWidth: 180 }}>
                    <strong>{c.complaintId}</strong>
                    <br />
                    {c.title}
                    <br />
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                        marginTop: 4,
                        background:
                          c.status === "resolved"
                            ? "#22c55e20"
                            : c.status === "assigned"
                              ? "#3b82f620"
                              : c.status === "in_progress"
                                ? "#a855f720"
                                : "#fb923c20",
                        color:
                          c.status === "resolved"
                            ? "#22c55e"
                            : c.status === "assigned"
                              ? "#3b82f6"
                              : c.status === "in_progress"
                                ? "#a855f7"
                                : "#fb923c",
                      }}
                    >
                      {c.status?.toUpperCase()}
                    </span>
                    <br />
                    <span style={{ color: "#666", fontSize: 11 }}>
                      Priority: {c.priority?.toUpperCase()} · {c.department?.name || "No Dept"}
                    </span>
                    {c.address && (
                      <>
                        <br />
                        <span style={{ color: "#666", fontSize: 11 }}>
                          {c.address.substring(0, 60)}
                        </span>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  );
}
