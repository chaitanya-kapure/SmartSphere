import React, { useState, useRef, useEffect, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE } from "../../config/mapbox";

const statusColors = {
  pending: "#fb923c",
  assigned: "#3b82f6",
  in_progress: "#a855f7",
  verification: "#f59e0b",
  resolved: "#22c55e",
  rejected: "#ef4444",
  reopened: "#ec4899",
};

function Pin({ color = "#94a3b8", size = 24 }) {
  return (
    <svg height={size} viewBox="0 0 24 24" style={{ cursor: "pointer", display: "block" }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={color} stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  );
}

export default function ComplaintMap({ complaints = [], height = 500 }) {
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const validComplaints = complaints.filter(
    (c) => c.location && c.location.coordinates && c.location.coordinates[0] !== 0
  );

  const mapCenter = validComplaints.length > 0
    ? { latitude: validComplaints[0].location.coordinates[1], longitude: validComplaints[0].location.coordinates[0], zoom: 12 }
    : { latitude: 20.5937, longitude: 78.9629, zoom: 5 };

  const onMapLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || validComplaints.length < 2) return;
    const lngs = validComplaints.map((c) => c.location.coordinates[0]);
    const lats = validComplaints.map((c) => c.location.coordinates[1]);
    const bounds = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];
    mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
  }, [loaded, validComplaints]);

  return (
    <div style={{ height, borderRadius: 12, overflow: "hidden" }}>
      <Map
        ref={mapRef}
        initialViewState={mapCenter}
        mapStyle={MAP_STYLE}
        onLoad={onMapLoad}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        {validComplaints.map((c) => (
          <Marker
            key={c._id || c.complaintId}
            latitude={c.location.coordinates[1]}
            longitude={c.location.coordinates[0]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected(c);
            }}
          >
            <Pin color={statusColors[c.status] || "#94a3b8"} />
          </Marker>
        ))}
        {selected && (
          <Popup
            latitude={selected.location.coordinates[1]}
            longitude={selected.location.coordinates[0]}
            anchor="bottom"
            onClose={() => setSelected(null)}
            closeButton={true}
            closeOnClick={false}
            style={{ fontFamily: "Segoe UI", fontSize: 13 }}
          >
            <div style={{ minWidth: 180, color: "#333" }}>
              <strong>{selected.complaintId}</strong>
              <br />
              {selected.title}
              <br />
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  marginTop: 4,
                  background: `${(statusColors[selected.status] || "#94a3b8")}20`,
                  color: statusColors[selected.status] || "#94a3b8",
                }}
              >
                {selected.status?.toUpperCase()}
              </span>
              <br />
              <span style={{ color: "#666", fontSize: 11 }}>
                Priority: {selected.priority?.toUpperCase()} · {selected.department?.name || "No Dept"}
              </span>
              {selected.address && (
                <>
                  <br />
                  <span style={{ color: "#666", fontSize: 11 }}>
                    {selected.address.substring(0, 60)}
                  </span>
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
