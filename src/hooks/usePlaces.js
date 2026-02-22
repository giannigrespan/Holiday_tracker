import { useState, useCallback } from 'react'
import { fetchNearbyPOI } from '../lib/overpass'

export function usePlaces() {
  const [places, setPlaces]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [userPos, setUserPos]   = useState(null)
  const [category, setCategory] = useState('restaurant')

  const locate = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizzazione non supportata da questo browser'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserPos(coords)
          resolve(coords)
        },
        err => {
          const msg = err.code === 1
            ? 'Permesso di localizzazione negato. Abilitalo nelle impostazioni del browser.'
            : 'Impossibile ottenere la posizione. Riprova.'
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 12000 }
      )
    })
  }, [])

  const search = useCallback(async (cat, coords) => {
    const pos = coords ?? userPos
    if (!pos) {
      setError('Localizzazione necessaria')
      return
    }
    setLoading(true)
    setError(null)
    setCategory(cat)
    try {
      const results = await fetchNearbyPOI(pos.lat, pos.lng, cat)
      setPlaces(results)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userPos])

  const locateAndSearch = useCallback(async (cat = 'restaurant') => {
    setLoading(true)
    setError(null)
    setCategory(cat)
    try {
      const coords = await locate()
      const results = await fetchNearbyPOI(coords.lat, coords.lng, cat)
      setPlaces(results)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [locate])

  return { places, loading, error, userPos, category, locate, search, locateAndSearch, setCategory }
}
