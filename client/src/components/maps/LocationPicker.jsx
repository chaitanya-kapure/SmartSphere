import React, { useState, useRef, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE, searchLocations, reverseGeocode } from "../../config/mapbox";

function Pin({ color = "#3b82f6", size = 28 }) {
  return (
    <svg height={size} viewBox="0 0 24 24" style={{ cursor: "pointer", display: "block" }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={color} stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  );
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
  btnDisabled: {
    width: "100%",
    padding: "14px 20px",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    borderRadius: 12,
    background: "#e2e8f0",
    color: "#94a3b8",
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
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 8,
  },
  previewCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 12,
  },
  previewTitle: { fontSize: 13, fontWeight: 600, color: "#16a34a", marginBottom: 6 },
  previewText: { fontSize: 13, color: "#475569", margin: "2px 0", lineHeight: 1.5 },
  coords: { fontSize: 12, color: "#64748b", marginTop: 4 },
  fetchingAddr: { fontSize: 12, color: "#64748b", marginTop: 8, marginBottom: 4 },
  mapHint: { fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "center" },
};

export default function LocationPicker({ onSelect }) {
  const [position, setPosition] = useState(null);
  const [viewState, setViewState] = useState({ latitude: 20.5937, longitude: 78.9629, zoom: 5 });
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [fetching, setFetching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const emitSelect = useCallback((lat, lng, addr, c, s, p) => {
    const cityVal = c || "";
    const stateVal = s || "";
    const pincodeVal = p || "";
    setAddress(addr);
    setCity(cityVal);
    setState(stateVal);
    setPincode(pincodeVal);
    onSelect({ lat, lng, address: addr, city: cityVal, state: stateVal, pincode: pincodeVal });
  }, [onSelect]);

  const doReverseGeocode = useCallback(async (lat, lng) => {
    setFetching(true);
    try {
      const result = await reverseGeocode(lng, lat);
      if (result) {
        emitSelect(lat, lng, result.placeName, result.city, result.state, result.pincode);
      } else {
        emitSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`, "", "", "");
      }
    } catch {
      emitSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`, "", "", "");
    } finally {
      setFetching(false);
    }
  }, [emitSelect]);

  const placeMarker = useCallback((lat, lng) => {
    setPosition({ lat, lng });
    setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng, zoom: 15 }));
    doReverseGeocode(lat, lng);
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
        placeMarker(pos.coords.latitude, pos.coords.longitude);
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
      setPredictions([]);
      setShowPredictions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchLocations(q);
        setPredictions(results);
        setShowPredictions(true);
      } catch {
        setPredictions([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelectPrediction = (prediction) => {
    const [lng, lat] = prediction.center;
    setSearchQuery(prediction.placeName);
    setShowPredictions(false);
    placeMarker(lat, lng);
  };

  const handleDragEnd = (e) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    setPosition({ lat, lng });
    doReverseGeocode(lat, lng);
  };

  const handleMapClick = (e) => {
    placeMarker(e.lngLat.lat, e.lngLat.lng);
  };

  const locationPicked = position && address;

  return (
    <div>
      <button
        style={gettingLocation ? styles.btnDisabled : styles.btnCurrent}
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
          onFocus={() => predictions.length > 0 && setShowPredictions(true)}
          onBlur={() => setTimeout(() => setShowPredictions(false), 200)}
        />
        {searching && <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>Searching...</p>}
        {showPredictions && predictions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%", left: 0, right: 0,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              maxHeight: 220,
              overflowY: "auto",
              zIndex: 1000,
              marginTop: 4,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {predictions.map((p, i) => (
              <div
                key={p.id}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#1e293b",
                  borderBottom: i < predictions.length - 1 ? "1px solid #e2e8f0" : "none",
                  lineHeight: 1.4,
                }}
                onMouseDown={() => handleSelectPrediction(p)}
              >
                {p.placeName}
              </div>
            ))}
          </div>
        )}
      </div>

      {fetching && <p style={styles.fetchingAddr}>Fetching address...</p>}

      {locationPicked && (
        <div style={styles.previewCard}>
          <div style={styles.previewTitle}>📍 Selected Address</div>
          <div style={styles.previewText}>{address}</div>
          {(city || state || pincode) && (
            <div style={styles.previewText}>{[city, state, pincode].filter(Boolean).join(", ")}</div>
          )}
          {position && (
            <div style={styles.coords}>
              Latitude: {position.lat.toFixed(6)} &nbsp; Longitude: {position.lng.toFixed(6)}
            </div>
          )}
        </div>
      )}

      <div style={{ height: 250, borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" />
          {position && (
            <Marker latitude={position.lat} longitude={position.lng} anchor="bottom" draggable onDragEnd={handleDragEnd}>
              <Pin />
            </Marker>
          )}
        </Map>
      </div>
      <p style={styles.mapHint}>Drag marker to adjust · Click map to reposition</p>
    </div>
  );
}
