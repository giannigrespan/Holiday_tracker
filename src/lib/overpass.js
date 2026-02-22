const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export const CATEGORY_MAP = {
  restaurant:  { tag: 'amenity=restaurant',  label: 'Ristoranti',  emoji: '🍽️' },
  cafe:        { tag: 'amenity=cafe',         label: 'Bar & Caffè', emoji: '☕' },
  museum:      { tag: 'tourism=museum',       label: 'Musei',       emoji: '🏛️' },
  attraction:  { tag: 'tourism=attraction',   label: 'Attrazioni',  emoji: '⭐' },
  supermarket: { tag: 'shop=supermarket',     label: 'Supermercati',emoji: '🛒' },
  bar:         { tag: 'amenity=bar',          label: 'Aperitivo',   emoji: '🍹' },
  viewpoint:   { tag: 'tourism=viewpoint',    label: 'Panorami',    emoji: '🌅' },
}

// Cache in-memory per evitare chiamate duplicate
const cache = new Map()

/**
 * Trova POI vicini tramite Overpass API (OpenStreetMap).
 *
 * @param {number} lat       Latitudine
 * @param {number} lng       Longitudine
 * @param {string} category  Chiave di CATEGORY_MAP
 * @param {number} radius    Raggio in metri (default 1500)
 */
export async function fetchNearbyPOI(lat, lng, category = 'restaurant', radius = 1500) {
  // Cache key arrotondata a ~110m per evitare too many unique keys
  const cacheKey = `${Math.round(lat * 1000)},${Math.round(lng * 1000)},${category}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const { tag } = CATEGORY_MAP[category] ?? CATEGORY_MAP.restaurant
  const [key, value] = tag.split('=')

  const query = `
    [out:json][timeout:25];
    (
      node["${key}"="${value}"](around:${radius},${lat},${lng});
      way["${key}"="${value}"](around:${radius},${lat},${lng});
    );
    out body center 40;
  `

  const res = await fetch(OVERPASS_URL, {
    method:  'POST',
    body:    `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`)

  const data = await res.json()

  const results = data.elements
    .map(el => ({
      id:      String(el.id),
      name:    el.tags?.name ?? 'Senza nome',
      lat:     el.lat ?? el.center?.lat,
      lng:     el.lon ?? el.center?.lon,
      opening: el.tags?.opening_hours ?? null,
      phone:   el.tags?.phone ?? null,
      website: el.tags?.website ?? null,
      cuisine: el.tags?.cuisine ?? null,
      category,
    }))
    .filter(p => p.lat && p.lng)

  // Cache 5 minuti
  cache.set(cacheKey, results)
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000)

  return results
}
