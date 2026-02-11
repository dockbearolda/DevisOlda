// URL du script Google Apps Script pour l'integration Google Sheets
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyt_iUCQpKuksy0qbkTD1-gj0m0HUkhuNCaf45fmFjtcQjrKADLZzK51GD-jCKOmVTq/exec"

/**
 * Envoie les donnees d'une commande vers Google Sheets
 * @param {Object} fiche - Les donnees de la fiche client
 * @returns {Promise<boolean>} - true si succes, false sinon
 */
export const sendToGoogleSheets = async (fiche) => {
  try {
    // Preparer les donnees selon le format attendu par le script Apps Script
    const data = {
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
      prix: (fiche.tshirtPrice || 25) + (fiche.personalizationPrice || 0),
      paye: fiche.isPaid ? 'Oui' : 'Non'
    }

    console.log('Envoi vers Google Sheets:', data)

    // Construire l'URL avec les parametres
    const params = new URLSearchParams(data).toString()
    const url = `${GOOGLE_SCRIPT_URL}?${params}`

    // Utiliser une image pour faire la requete GET (contourne CORS)
    const img = new Image()
    img.src = url

    console.log('Donnees envoyees vers Google Sheets:', url)
    return true

  } catch (error) {
    console.error('Erreur lors de l\'envoi vers Google Sheets:', error)
    return false
  }
}

/**
 * Formate le numero de telephone en local (supprime l'indicatif international)
 * Conserve uniquement le numero commencant par 0
 */
const formatPhoneNumber = (countryCode, phone) => {
  if (!phone) return ''
  // Nettoyer le numero (garder uniquement les chiffres)
  let cleanPhone = phone.replace(/\D/g, '')
  // Supprimer l'indicatif international s'il est present au debut
  const code = String(countryCode || '')
  if (code && cleanPhone.startsWith(code)) {
    cleanPhone = cleanPhone.slice(code.length)
  }
  // S'assurer que le numero commence par 0
  if (!cleanPhone.startsWith('0')) {
    cleanPhone = '0' + cleanPhone
  }
  return cleanPhone
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
 * Obtient le nom de la couleur (mapping complet TSHIRT_COLORS + LOGO_COLORS)
 */
const getColorName = (hex) => {
  const colors = {
    // Couleurs T-shirt
    '#FFFFFF': 'Blanc Pure', '#1A1A1A': 'Noir Deep',
    '#FDFD96': 'Jaune Pastel', '#FFD1DC': 'Rose Pastel',
    '#B3E5FC': 'Bleu Ciel', '#C1E1C1': 'Vert Menthe',
    '#E6E6FA': 'Lavande', '#FFDAB9': 'Peche',
    '#F5F5DC': 'Beige', '#B0E0E6': 'Bleu Poudre',
    '#F08080': 'Corail Douce', '#D3D3D3': 'Gris Clair',
    '#FAF0E6': 'Lin', '#FFF5EE': 'Coquillage', '#F0FFFF': 'Azure',
    // Couleurs Logo
    '#000000': 'Noir', '#FF3B30': 'Rouge Apple',
    '#007AFF': 'Bleu Apple', '#34C759': 'Vert Apple',
    '#FFCC00': 'Or / Jaune', '#AF52DE': 'Violet',
    '#5856D6': 'Indigo', '#FF9500': 'Orange',
    '#A2845E': 'Bronze', '#8E8E93': 'Gris',
    '#C0C0C0': 'Argent', '#FF2D55': 'Rose Flash',
    '#5AC8FA': 'Bleu Cyan', '#000080': 'Marine', '#556B2F': 'Olive'
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
