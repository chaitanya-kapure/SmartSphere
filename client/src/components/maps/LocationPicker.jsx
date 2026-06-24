import React, { useState, useRef, useCallback, useEffect } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from "../../config/googleMaps";

const containerStyle = { width: "100%", height: 250, borderRadius: 12 };

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
  coords: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  searching: { fontSize: 12, color: "#94a3b8", marginTop: -4, marginBottom: 8 },
  fetchingAddr: { fontSize: 12, color: "#94a3b8", marginTop: 8, marginBottom: 4 },
};

export default function LocationPicker({ onSelect }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [fetching, setFetching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [center, setCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const mapRef = useRef(null);
  const debounceRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  const emitSelect = useCallback((lat, lng, addr, c, s, p) => {
    const cityVal = c || "";
    const stateVal = s || "";
    const pincodeVal = p || "";
    setAddress(addr);
    setCity(cityVal);
    setState(stateVal);
    setPincode(pincodeVal);
    onSelect({
      lat, lng, address: addr,
      city: cityVal, state: stateVal, pincode: pincodeVal,
    });
  }, [onSelect]);

  const doReverseGeocode = useCallback((lat, lng) => {
    if (!geocoderRef.current) return;
    setFetching(true);
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      setFetching(false);
      if (status === "OK" && results[0]) {
        const addr = results[0].formatted_address;
        let c = "", s = "", p = "";
        for (const comp of results[0].address_components) {
          if (comp.types.includes("locality")) c = comp.long_name;
          else if (comp.types.includes("sublocality") && !c) c = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) s = comp.long_name;
          if (comp.types.includes("postal_code")) p = comp.long_name;
        }
        emitSelect(lat, lng, addr, c, s, p);
      } else {
        emitSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`, "", "", "");
      }
    });
  }, [emitSelect]);

  const placeMarker = useCallback((lat, lng) => {
    const ll = { lat, lng };
    setPosition(ll);
    setCenter(ll);
    if (mapRef.current) mapRef.current.panTo(ll);
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
    debounceRef.current = setTimeout(() => {
      if (!window.google?.maps?.places?.AutocompleteService) return;
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: q, types: ["geocode", "establishment"] },
        (preds, status) => {
          if (status === "OK" && preds) {
            setPredictions(preds);
            setShowPredictions(true);
          }
        }
      );
    }, 500);
  };

  const handleSelectPrediction = (prediction) => {
    setSearchQuery(prediction.description);
    setShowPredictions(false);
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        placeMarker(loc.lat(), loc.lng());
      }
    });
  };

  const handleDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPosition({ lat, lng });
    doReverseGeocode(lat, lng);
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapClick = (e) => {
    placeMarker(e.latLng.lat(), e.latLng.lng());
  };

  const locationPicked = position && address;

  if (loadError) {
    return (
      <div style={{ color: "#ef4444", padding: 16, textAlign: "center", fontSize: 14 }}>
        Google Maps failed to load. Check your API key and try again.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ color: "#94a3b8", padding: 16, textAlign: "center", fontSize: 14 }}>
        Loading Google Maps...
      </div>
    );
  }

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
        {showPredictions && predictions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%", left: 0, right: 0,
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 12,
              maxHeight: 220,
              overflowY: "auto",
              zIndex: 1000,
              marginTop: 4,
            }}
          >
            {predictions.map((p, i) => (
              <div
                key={p.place_id}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#e2e8f0",
                  borderBottom: i < predictions.length - 1 ? "1px solid #334155" : "none",
                  lineHeight: 1.4,
                }}
                onMouseDown={() => handleSelectPrediction(p)}
              >
                {p.description}
              </div>
            ))}
          </div>
        )}
      </div>

      {fetching && <div style={styles.fetchingAddr}>Fetching address...</div>}

      {locationPicked && (
        <div style={styles.previewCard}>
          <div style={styles.previewTitle}>📍 Selected Address</div>
          <div style={styles.previewText}>{address}</div>
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
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center || { lat: 20.5937, lng: 78.9629 }}
          zoom={center ? 15 : 5}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          options={{ disableDefaultUI: false, streetViewControl: false }}
        >
          {position && (
            <Marker
              position={position}
              draggable={true}
              onDragEnd={handleDragEnd}
            />
          )}
        </GoogleMap>
      </div>
      <p style={{ fontSize: 11, color: "#475569", marginTop: 4, textAlign: "center" }}>
        Drag marker to adjust · Click map to reposition
      </p>
    </div>
  );
}
