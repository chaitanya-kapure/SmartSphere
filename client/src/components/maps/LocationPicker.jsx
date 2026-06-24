import React, { useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { reverseGeocode, searchLocation } from "../../services/complaintService";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapController({ center, zoom }) {
  const map = useMap();
  if (center) map.setView(center, zoom || 15);
  return null;
}

const styles = {
  btnCurrent: {
    width: "100%",
    padding: "14px 20px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
    touchAction: "manipulation",
  },
  btnCurrentDisabled: {
    width: "100%",
    padding: "14px 20px",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    borderRadius: 12,
    background: "#334155",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#e2e8f0",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 8,
  },
  previewCard: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#22c55e",
    marginBottom: 6,
  },
  previewText: {
    fontSize: 13,
    color: "#cbd5e1",
    margin: "2px 0",
    lineHeight: 1.5,
  },
  previewLabel: {
    fontSize: 11,
    color: "#64748b",
    marginRight: 4,
  },
  coords: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  searching: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: -4,
    marginBottom: 8,
  },
  fetchingAddr: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
    marginBottom: 4,
  },
};

export default function LocationPicker({ onSelect }) {
  const [position, setPosition] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [center, setCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);

  const emitSelect = useCallback((latlng, addrData) => {
    const d = addrData || {};
    onSelect({
      lat: latlng.lat,
      lng: latlng.lng,
      address: d.displayName || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      city: d.address?.city || "",
      state: d.address?.state || "",
      pincode: d.address?.postcode || "",
      addressDetails: d.address || {},
    });
  }, [onSelect]);

  const doReverseGeocode = useCallback(async (latlng) => {
    setFetching(true);
    try {
      const { data } = await reverseGeocode(latlng.lat, latlng.lng);
      const addrData = {
        displayName: data.displayName,
        address: data.address || {},
      };
      setAddressData(addrData);
      emitSelect(latlng, addrData);
    } catch {
      const fallback = { displayName: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`, address: {} };
      setAddressData(fallback);
      emitSelect(latlng, fallback);
    } finally {
      setFetching(false);
    }
  }, [emitSelect]);

  const placeMarker = useCallback((latlng) => {
    setPosition(latlng);
    setCenter(latlng);
    doReverseGeocode(latlng);
  }, [doReverseGeocode]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGettingLocation(false);
        placeMarker(L.latLng(pos.coords.latitude, pos.coords.longitude));
      },
      () => {
        setGettingLocation(false);
        alert("Could not get current location. Check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchInput = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await searchLocation(q);
        setSearchResults(data);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelectResult = (result) => {
    const latlng = L.latLng(result.lat, result.lng);
    setPosition(latlng);
    setCenter(latlng);
    setSearchQuery(result.displayName?.split(",")[0] || result.displayName);
    setShowResults(false);
    const addrData = { displayName: result.displayName, address: result.address || {} };
    setAddressData(addrData);
    emitSelect(latlng, addrData);
  };

  const handleDragEnd = (e) => {
    const latlng = e.target.getLatLng();
    setPosition(latlng);
    doReverseGeocode(latlng);
  };

  function ClickHandler() {
    useMapEvents({
      click(e) { placeMarker(e.latlng); },
    });
    return null;
  }

  const displayName = addressData?.displayName || "";
  const city = addressData?.address?.city || "";
  const state = addressData?.address?.state || "";
  const pincode = addressData?.address?.postcode || "";
  const locationPicked = position && displayName;

  return (
    <div>
      <button
        style={gettingLocation ? styles.btnCurrentDisabled : styles.btnCurrent}
        onClick={handleLocateMe}
        disabled={gettingLocation}
      >
        {gettingLocation ? "⏳ Getting Location..." : "📍 Use My Current Location"}
      </button>

      <div style={{ position: "relative", marginBottom: 8 }}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search location (area, landmark, market...)"
          value={searchQuery}
          onChange={handleSearchInput}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {searching && <div style={styles.searching}>Searching...</div>}
        {showResults && searchResults.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 12,
              maxHeight: 220,
              overflowY: "auto",
              zIndex: 1000,
              marginTop: 4,
            }}
          >
            {searchResults.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#e2e8f0",
                  borderBottom: i < searchResults.length - 1 ? "1px solid #334155" : "none",
                  lineHeight: 1.4,
                }}
                onMouseDown={() => handleSelectResult(r)}
              >
                {r.displayName}
              </div>
            ))}
          </div>
        )}
      </div>

      {fetching && <div style={styles.fetchingAddr}>Fetching address...</div>}

      {locationPicked && (
        <div style={styles.previewCard}>
          <div style={styles.previewTitle}>📍 Selected Address</div>
          <div style={styles.previewText}>{displayName}</div>
          {(city || state || pincode) && (
            <div style={styles.previewText}>
              {[city, state, pincode].filter(Boolean).join(", ")}
            </div>
          )}
          {position && (
            <div style={styles.coords}>
              Latitude: {position.lat.toFixed(6)} &nbsp; Longitude: {position.lng.toFixed(6)}
            </div>
          )}
        </div>
      )}

      <div style={{ height: 250, borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
        <MapContainer
          center={center || [20.5937, 78.9629]}
          zoom={center ? 15 : 5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler />
          {center && <MapController center={center} zoom={15} />}
          {position && (
            <Marker
              position={position}
              icon={icon}
              draggable={true}
              eventHandlers={{ dragend: handleDragEnd }}
            />
          )}
        </MapContainer>
      </div>
      <p style={{ fontSize: 11, color: "#475569", marginTop: 4, textAlign: "center" }}>
        Pinch to zoom · Drag marker to adjust
      </p>
    </div>
  );
}
