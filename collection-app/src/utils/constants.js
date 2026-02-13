// Couleurs T-shirt disponibles
export const TSHIRT_COLORS = [
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Noir', hex: '#111827' },
  { name: 'Gris Chiné', hex: '#9CA3AF' },
  { name: 'Marine', hex: '#1E3A5F' },
  { name: 'Bleu Royal', hex: '#2563EB' },
  { name: 'Rouge', hex: '#DC2626' },
  { name: 'Bordeaux', hex: '#881337' },
  { name: 'Vert Forêt', hex: '#166534' },
  { name: 'Jaune', hex: '#EAB308' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Bleu Ciel', hex: '#7DD3FC' },
  { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Kaki', hex: '#6B7F3B' },
]

// Couleurs Logo disponibles
export const LOGO_COLORS = [
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Noir', hex: '#111827' },
  { name: 'Or', hex: '#D4A017' },
  { name: 'Argent', hex: '#C0C0C0' },
  { name: 'Rouge', hex: '#DC2626' },
  { name: 'Bleu', hex: '#2563EB' },
  { name: 'Vert', hex: '#16A34A' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Jaune', hex: '#EAB308' },
  { name: 'Marine', hex: '#1E3A5F' },
]

// Tailles disponibles
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Génère un ID commande : CMD-20260213-A7K2
export const generateOrderId = () => {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let rand = ''
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `CMD-${date}-${rand}`
}

// Formate la date du jour en français
export const formatDateFr = (date = new Date()) => {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
