import { NavLink, useParams } from 'react-router-dom'
import {
  ReceiptPercentIcon,
  ScaleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import {
  ReceiptPercentIcon as ReceiptSolid,
  ScaleIcon as ScaleSolid,
  MapPinIcon as MapSolid,
} from '@heroicons/react/24/solid'

const tabs = [
  { path: 'expenses', label: 'Spese',  Icon: ReceiptPercentIcon, ActiveIcon: ReceiptSolid },
  { path: 'balance',  label: 'Saldo',  Icon: ScaleIcon,           ActiveIcon: ScaleSolid  },
  { path: 'places',   label: 'Luoghi', Icon: MapPinIcon,          ActiveIcon: MapSolid   },
]

export default function BottomNav() {
  const { tripId } = useParams()

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, label, Icon, ActiveIcon }) => (
        <NavLink
          key={path}
          to={`/trip/${tripId}/${path}`}
          style={{ flex: 1 }}
        >
          {({ isActive }) => {
            const Ico = isActive ? ActiveIcon : Icon
            return (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '4px 0',
                color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-3)',
                transition: 'color 0.15s',
              }}>
                <Ico style={{ width: 24, height: 24 }} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </div>
            )
          }}
        </NavLink>
      ))}
    </nav>
  )
}
