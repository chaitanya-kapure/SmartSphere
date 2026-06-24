export const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const GEOCODING_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export async function searchLocations(query) {
  if (!MAPBOX_TOKEN || !query.trim()) return [];
  const url = `${GEOCODING_BASE}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=address,locality,place,poi,region,neighborhood`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return (data.features || []).map((f) => ({
    id: f.id,
    placeName: f.place_name,
    center: f.center,
    text: f.text,
  }));
}

export async function reverseGeocode(lng, lat) {
  if (!MAPBOX_TOKEN) return null;
  const url = `${GEOCODING_BASE}/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,locality,place,region,postcode,neighborhood`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;
  const ctx = feature.context || [];
  const city =
    ctx.find((c) => c.id.startsWith("place"))?.text ||
    ctx.find((c) => c.id.startsWith("locality"))?.text ||
    "";
  const state = ctx.find((c) => c.id.startsWith("region"))?.text || "";
  const pincode = ctx.find((c) => c.id.startsWith("postcode"))?.text || "";
  return {
    placeName: feature.place_name,
    city,
    state,
    pincode,
  };
}
