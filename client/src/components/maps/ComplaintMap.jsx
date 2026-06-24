import React, { useState, useCallback } from "react";
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from "../../config/googleMaps";

const containerStyle = { width: "100%", height: "100%" };

const statusColors = {
  pending: "#fb923c",
  assigned: "#3b82f6",
  in_progress: "#a855f7",
  verification: "#f59e0b",
  resolved: "#22c55e",
  rejected: "#ef4444",
  reopened: "#ec4899",
};

function createIcon(color) {
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.5,
    anchor: new window.google.maps.Point(12, 22),
    labelOrigin: new window.google.maps.Point(12, 12),
  };
}

export default function ComplaintMap({ complaints = [], height = 500 }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [selected, setSelected] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const validComplaints = complaints.filter(
    (c) => c.location && c.location.coordinates && c.location.coordinates[0] !== 0
  );

  const mapCenter = validComplaints.length > 0
    ? { lat: validComplaints[0].location.coordinates[1], lng: validComplaints[0].location.coordinates[0] }
    : { lat: 20.5937, lng: 78.9629 };

  const onLoad = useCallback((map) => {
    setMapRef(map);
    if (validComplaints.length > 1 && map) {
      const bounds = new window.google.maps.LatLngBounds();
      validComplaints.forEach((c) =>
        bounds.extend({ lat: c.location.coordinates[1], lng: c.location.coordinates[0] })
      );
      map.fitBounds(bounds);
    }
  }, [validComplaints]);

  if (loadError) {
    return (
      <div
        style={{
          height, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0f172a", color: "#ef4444", fontSize: 14,
        }}
      >
        Google Maps failed to load. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          height, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0f172a", color: "#94a3b8", fontSize: 14,
        }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ height, borderRadius: 12, overflow: "hidden" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={validComplaints.length > 0 ? 12 : 5}
        onLoad={onLoad}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {validComplaints.map((c) => (
          <Marker
            key={c._id || c.complaintId}
            position={{ lat: c.location.coordinates[1], lng: c.location.coordinates[0] }}
            icon={createIcon(statusColors[c.status] || "#94a3b8")}
            onClick={() => setSelected(c)}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{
              lat: selected.location.coordinates[1],
              lng: selected.location.coordinates[0],
            }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ fontFamily: "Segoe UI", fontSize: 13, color: "#333", minWidth: 180 }}>
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
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
