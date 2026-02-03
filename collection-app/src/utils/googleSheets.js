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
      prixTshirt: fiche.tshirtPrice || 25,
      prixPerso: fiche.personalizationPrice || 0,
      paye: fiche.isPaid ? 'Oui' : '',
      nonPaye: fiche.isPaid ? '' : 'Oui'
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
    '#F97316': 'Orange vif', '#A855F7': 'Violet clair'
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
