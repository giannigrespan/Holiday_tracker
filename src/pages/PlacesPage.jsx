import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { usePlaces } from '../hooks/usePlaces'
import { CATEGORY_MAP } from '../lib/overpass'

// Icona personalizzata per i marker
function makeIcon(emoji) {
  return L.divIcon({
    html: `<div style="
      width:36px; height:36px;
      background: var(--color-surface);
      border: 2px solid var(--color-accent);
      border-radius: 50%;
      display:flex; align-items:center; justify-content:center;
      font-size:16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    ">${emoji}</div>`,
    className: '',
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

const userIcon = L.divIcon({
  html: `<div style="
    width:16px; height:16px;
    background: var(--color-accent);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(139,92,246,0.3);
    animation: pulse-accent 2s ease infinite;
  "></div>`,
  className: '',
  iconSize:   [16, 16],
  iconAnchor: [8, 8],
})

function RecenterMap({ pos }) {
  const map = useMap()
  useEffect(() => {
    if (pos) map.setView([pos.lat, pos.lng], 15, { animate: true })
  }, [pos, map])
  return null
}

export default function PlacesPage() {
  const { places, loading, error, userPos, category, locateAndSearch, search } = usePlaces()
  const [selectedPlace, setSelectedPlace] = useState(null)

  const categories = Object.entries(CATEGORY_MAP)

  const handleCategoryChange = (cat) => {
    if (userPos) search(cat, userPos)
    else locateAndSearch(cat)
  }

  return (
    <div style={{ position: 'relative', height: 'calc(100dvh - var(--nav-height))', display: 'flex', flexDirection: 'column' }}>

      {/* Filtro categorie (sopra la mappa) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: '12px 12px 8px',
        background: 'linear-gradient(180deg, rgba(9,9,11,0.95) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {categories.map(([key, { label, emoji }]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 100,
                border: `1.5px solid ${category === key ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: category === key ? 'rgba(139,92,246,0.2)' : 'rgba(24,24,27,0.9)',
                color: category === key ? 'var(--color-accent-light)' : 'var(--color-text-2)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mappa */}
      {userPos ? (
        <MapContainer
          center={[userPos.lat, userPos.lng]}
          zoom={15}
          style={{ flex: 1, width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <RecenterMap pos={userPos} />
          {/* Posizione utente */}
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
            <Popup>📍 Sei qui</Popup>
          </Marker>
          {/* POI */}
          {places.map(place => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={makeIcon(CATEGORY_MAP[place.category]?.emoji ?? '📌')}
              eventHandlers={{ click: () => setSelectedPlace(place) }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong style={{ fontSize: 14 }}>{place.name}</strong>
                  {place.opening && (
                    <p style={{ fontSize: 11, color: '#666', marginTop: 4 }}>🕐 {place.opening}</p>
                  )}
                  {place.phone && (
                    <p style={{ fontSize: 11, marginTop: 2 }}>
                      📞 <a href={`tel:${place.phone}`}>{place.phone}</a>
                    </p>
                  )}
                  {place.website && (
                    <p style={{ fontSize: 11, marginTop: 2 }}>
                      🌐 <a href={place.website} target="_blank" rel="noreferrer">Sito web</a>
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#8b5cf6' }}
                  >
                    Apri in Maps →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        /* Stato iniziale — nessuna posizione */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 32,
          background: 'var(--color-bg)',
        }}>
          <div style={{ fontSize: 56 }}>🗺️</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Scopri i dintorni</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.5 }}>
              Tocca il pulsante per localizzarti e vedere ristoranti, musei e attrazioni vicino a te
            </p>
          </div>
          <button
            onClick={() => locateAndSearch('restaurant')}
            disabled={loading}
            className="btn-primary"
            style={{ maxWidth: 280 }}
          >
            {loading ? '📡 Localizzazione...' : '📍 Usa la mia posizione'}
          </button>
          {error && (
            <p style={{ fontSize: 13, color: 'var(--color-danger)', textAlign: 'center' }}>{error}</p>
          )}
        </div>
      )}

      {/* Overlay loading */}
      {loading && userPos && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 100,
          padding: '10px 20px',
          fontSize: 13,
          color: 'var(--color-text-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            width: 14, height: 14,
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            display: 'inline-block',
          }} className="animate-spin-slow" />
          Ricerca in corso...
        </div>
      )}

      {/* Counter risultati */}
      {!loading && userPos && places.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 100,
          padding: '8px 16px',
          fontSize: 12,
          color: 'var(--color-text-2)',
          whiteSpace: 'nowrap',
        }}>
          {places.length} luoghi trovati · {CATEGORY_MAP[category]?.label}
        </div>
      )}
    </div>
  )
}
