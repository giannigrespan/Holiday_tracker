/** Formatta un importo con la valuta */
export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('it-IT', {
    style:    'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Formatta una data in formato leggibile italiano */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('it-IT', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  }).format(new Date(dateStr))
}

/** Formatta solo giorno/mese (per raggruppare spese) */
export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString())     return 'Oggi'
  if (d.toDateString() === yesterday.toDateString()) return 'Ieri'

  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' }).format(d)
}

/** Label leggibile per categoria spesa */
export const CATEGORY_LABELS = {
  flight:        'Aereo',
  car_rental:    'Noleggio Auto',
  accommodation: 'Alloggio',
  food:          'Alimentari',
  excursion:     'Escursione',
  other:         'Altro',
}

export const CATEGORY_EMOJIS = {
  flight:        '✈️',
  car_rental:    '🚗',
  accommodation: '🏨',
  food:          '🛒',
  excursion:     '🗺️',
  other:         '📌',
}

export const CATEGORY_COLORS = {
  flight:        'var(--color-cat-flight)',
  car_rental:    'var(--color-cat-car_rental)',
  accommodation: 'var(--color-cat-accommodation)',
  food:          'var(--color-cat-food)',
  excursion:     'var(--color-cat-excursion)',
  other:         'var(--color-cat-other)',
}
