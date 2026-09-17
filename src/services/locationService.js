const LOCATION_API = "https://countriesnow.space/api/v0.1";

async function postJson(path, body) {
  const res = await fetch(`${LOCATION_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Location lookup failed. Please try again.");
  }
  return res.json();
}

export async function getCountries() {
  const res = await fetch(`${LOCATION_API}/countries/iso`);
  if (!res.ok) {
    throw new Error("Could not load countries.");
  }
  const json = await res.json();
  return (json.data ?? [])
    .map((item) => item.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function getStates(country) {
  const json = await postJson("/countries/states", { country });
  return (json.data?.states ?? [])
    .map((item) => item.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function getCitiesByState(country, state) {
  const json = await postJson("/countries/state/cities", { country, state });
  return (json.data ?? [])
    .map((item) => String(item))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function getCitiesByCountry(country) {
  const json = await postJson("/countries/cities", { country });
  return (json.data ?? [])
    .map((item) => String(item))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function formatLocationAddress({ city, state, country }) {
  return [city, state, country].map((part) => part?.trim()).filter(Boolean).join(", ");
}
