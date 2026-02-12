// URL du script Google Apps Script pour l'integration Google Sheets
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyagbLyE5L6rs0wJbUltvzazIS4gyIO3nFjpCmETu6vkP4JLvAtbv7UlYmwX1akLgaS/exec"

// Anti-doublon persistant (survit aux rechargements de page)
const SENT_ORDERS_KEY = 'olda_sent_orders'

const getSentOrders = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SENT_ORDERS_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

const markAsSent = (idCommande) => {
  const sent = getSentOrders()
  sent.add(idCommande)
  // Garder seulement les 200 derniers pour eviter le bloat localStorage
  const arr = [...sent].slice(-200)
  localStorage.setItem(SENT_ORDERS_KEY, JSON.stringify(arr))
}

// Verrou global : empeche tout envoi simultane
let submitting = false

/**
 * Envoie les donnees d'une commande vers Google Sheets via fetch (UNE seule requete)
 * Remplace l'ancienne methode iframe qui causait des lignes en double
 * @param {Object} fiche - Les donnees de la fiche client
 * @param {string} [mockupBase64] - Image base64 du mockup (optionnel)
 * @returns {Promise<boolean>} - true si succes, false sinon
 */
export const sendToGoogleSheets = async (fiche, mockupBase64) => {
  try {
    const idCommande = (fiche.id || '').replace('fiche-', '').substring(0, 8).toUpperCase()

    // Anti-doublon persistant (survit au rechargement de page)
    if (getSentOrders().has(idCommande)) {
      console.warn('Commande deja envoyee (doublon bloque):', idCommande)
      return true
    }

    // Verrou anti-envoi simultane
    if (submitting) {
      console.warn('Envoi deja en cours, requete ignoree')
      return true
    }
    submitting = true

    // Calculer les prix
    const prixTshirt = fiche.tshirtPrice || 0
    const prixPerso = fiche.personalizationPrice || 0
    const totalTTC = prixTshirt + prixPerso

    // Preparer les donnees (colonnes A-O + mockup optionnel)
    const data = {
      idCommande: idCommande,
      client: fiche.clientName || '',
      tel: formatPhoneNumber(fiche.phoneCountryCode, fiche.clientPhone),
      collection: getCollectionName(fiche.target),
      reference: getModelReference(fiche),
      echeance: formatDeadline(fiche.deadline),
      taille: fiche.size || 'M',
      couleurTshirt: getColorName(fiche.tshirtColor),
      couleurLogo: getColorName(fiche.logoColor),
      logoAvant: fiche.frontLogo ? 'Oui' : 'Non',
      logoArriere: fiche.backLogo ? 'Oui' : 'Non',
      prixTshirt: String(prixTshirt),
      prixPerso: String(prixPerso),
      total: String(totalTTC),
      paye: fiche.isPaid ? 'Oui' : 'Non'
    }

    // Ajouter le mockup base64 si disponible
    if (mockupBase64 && mockupBase64.length > 100) {
      data.mockupBase64 = mockupBase64
    }

    console.log('Envoi vers Google Sheets (fetch unique):', {
      ...data,
      mockupBase64: data.mockupBase64 ? '[base64 present]' : 'aucun'
    })

    // === ENVOI UNIQUE via fetch ===
    // - mode no-cors : evite les problemes CORS avec Google Apps Script
    // - Content-Type text/plain : evite le preflight OPTIONS
    // - Corps JSON : toutes les donnees dans une seule requete
    // - UNE SEULE requete HTTP (contrairement a l'iframe qui causait des doublons)
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    })

    // Marquer comme envoye (persiste dans localStorage)
    markAsSent(idCommande)
    console.log('Commande envoyee avec succes:', idCommande)

    return true
  } catch (error) {
    console.error('Erreur lors de l\'envoi vers Google Sheets:', error)
    return false
  } finally {
    submitting = false
  }
}

/**
 * Formate le numero de telephone avec le code pays
 */
const formatPhoneNumber = (countryCode, phone) => {
  if (!phone) return ''
  const cleanPhone = phone.replace(/\D/g, '')
  const phoneWithoutLeadingZero = cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone
  return `+${countryCode || '590'}${phoneWithoutLeadingZero}`
}

/**
 * Obtient le nom de la collection
 */
const getCollectionName = (target) => {
  const collections = { H: 'Homme', F: 'Femme', E: 'Enfant', B: 'Bebe' }
  return collections[target] || ''
}

/**
 * Obtient la reference du modele
 */
const getModelReference = (fiche) => {
  if (fiche.reference === 'MANUEL') {
    return fiche.manualReference || 'Manuel'
  }
  return fiche.reference || ''
}

/**
 * Obtient le nom de la couleur
 */
const getColorName = (hex) => {
  const colors = {
    '#FFFFFF': 'Blanc', '#000000': 'Noir', '#1A1A1A': 'Noir',
    '#D3D3D3': 'Gris', '#E5E5E5': 'Gris clair', '#9CA3AF': 'Gris moyen',
    '#EF4444': 'Rouge', '#F59E0B': 'Orange', '#EAB308': 'Jaune',
    '#22C55E': 'Vert', '#3B82F6': 'Bleu', '#8B5CF6': 'Violet',
    '#EC4899': 'Rose', '#0EA5E9': 'Bleu ciel', '#14B8A6': 'Turquoise',
    '#F97316': 'Orange vif', '#A855F7': 'Violet clair',
    '#FDFD96': 'Jaune Pastel', '#FFD1DC': 'Rose Pastel',
    '#B3E5FC': 'Bleu Ciel', '#C1E1C1': 'Vert Menthe',
    '#E6E6FA': 'Lavande', '#FFDAB9': 'Peche', '#F5F5DC': 'Beige',
    '#B0E0E6': 'Bleu Poudre', '#F08080': 'Corail Douce',
    '#FAF0E6': 'Lin', '#FFF5EE': 'Coquillage', '#F0FFFF': 'Azure',
    '#FF3B30': 'Rouge Apple', '#007AFF': 'Bleu Apple',
    '#34C759': 'Vert Apple', '#FFCC00': 'Or / Jaune',
    '#AF52DE': 'Violet', '#5856D6': 'Indigo', '#FF9500': 'Orange',
    '#A2845E': 'Bronze', '#8E8E93': 'Gris', '#C0C0C0': 'Argent',
    '#FF2D55': 'Rose Flash', '#5AC8FA': 'Bleu Cyan',
    '#000080': 'Marine', '#556B2F': 'Olive'
  }
  return colors[hex] || hex || ''
}

/**
 * Formate la date d'echeance
 */
const formatDeadline = (deadline) => {
  if (!deadline) return ''

  try {
    const date = new Date(deadline)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return deadline
  }
}

export default sendToGoogleSheets
