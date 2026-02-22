import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import './styles/globals.css'
import App from './App.jsx'

// Fix icone Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconRetinaUrl: iconUrl,
  iconAnchor:   [12, 41],
  iconSize:     [25, 41],
  shadowSize:   [41, 41],
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
