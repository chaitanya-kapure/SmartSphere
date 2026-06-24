import api from "../api/axios";

// Free tile source for MapLibre GL — no API key or billing required.
// Uses CARTO Positron (light) basemap. Free tier: 500k tile requests/day.
export const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const cache = new Map();
const CACHE_TTL = 60000;

let searchReqId = 0;

export async function searchLocations(query) {
  if (!query.trim()) return [];

  const cacheKey = `search:${query.trim()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const reqId = ++searchReqId;

  try {
    const res = await api.get("/maps/search", { params: { q: query.trim() } });
    if (reqId !== searchReqId) return [];

    const data = res.data || [];
    const mapped = data.map((r, i) => ({
      id: `${r.lat}_${r.lng}_${i}`,
      placeName: r.displayName,
      center: [parseFloat(r.lng), parseFloat(r.lat)],
    }));

    cache.set(cacheKey, { data: mapped, ts: Date.now() });
    return mapped;
  } catch {
    return [];
  }
}

export async function reverseGeocode(lng, lat) {
  const cacheKey = `reverse:${parseFloat(lat).toFixed(4)},${parseFloat(lng).toFixed(4)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await api.get("/maps/reverse-geocode", { params: { lat, lng } });
    const d = res.data || {};
    const result = {
      placeName: d.displayName || "",
      city: (d.address && d.address.city) || "",
      state: (d.address && d.address.state) || "",
      pincode: (d.address && d.address.postcode) || "",
    };

    cache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch {
    return null;
  }
}
