import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { reverseGeocode } from "../../services/complaintService";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ onSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [fetching, setFetching] = useState(false);

  const handleLocationSelect = async (latlng) => {
    setPosition(latlng);
    setFetching(true);
    try {
      const { data } = await reverseGeocode(latlng.lat, latlng.lng);
      setAddress(data.displayName || `${latlng.lat}, ${latlng.lng}`);
      onSelect({ lat: latlng.lat, lng: latlng.lng, address: data.displayName });
    } catch {
      const addr = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      setAddress(addr);
      onSelect({ lat: latlng.lat, lng: latlng.lng, address: addr });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div>
      <div style={{ height: 300, marginBottom: 8 }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} icon={icon} />}
        </MapContainer>
      </div>
      {fetching && (
        <p style={{ fontSize: 12, color: "#94a3b8" }}>Fetching address...</p>
      )}
      {position && !fetching && (
        <p style={{ fontSize: 12, color: "#22c55e", marginBottom: 8 }}>
          {address}
        </p>
      )}
    </div>
  );
}
