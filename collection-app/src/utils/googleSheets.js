// URL du script Google Apps Script pour l'integration Google Sheets
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMM6H59JW7qFXnvr_Ars8h_fG1yeybdXuvUYiXRQaYBg2yu7gzVGaSoeqIF4ZYTAM/exec"

/**
 * Envoie les donnees d'une commande vers Google Sheets via formulaire POST (iframe)
 * Methode fiable qui contourne les problemes CORS avec Google Apps Script
 * @param {Object} fiche - Les donnees de la fiche client
 * @param {string} [mockupBase64] - Image base64 du mockup (optionnel)
 * @returns {Promise<boolean>} - true si succes, false sinon
 */
export const sendToGoogleSheets = async (fiche, mockupBase64) => {
  try {
    // Calculer les prix (envoyes en nombres)
    const prixTshirt = fiche.tshirtPrice || 0
    const prixPerso = fiche.personalizationPrice || 0
    const totalTTC = prixTshirt + prixPerso

    // Generer un ID commande court
    const idCommande = (fiche.id || '').replace('fiche-', '').substring(0, 8).toUpperCase()

    // Preparer les champs du formulaire (colonnes A-P)
    const fields = {
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
    if (mockupBase64) {
      fields.mockupBase64 = mockupBase64
    }

    console.log('Envoi vers Google Sheets (form POST):', {
      ...fields,
      mockupBase64: mockupBase64 ? '[base64 present]' : 'aucun'
    })

    // Envoyer via formulaire cache dans un iframe (contourne CORS de facon fiable)
    submitViaIframe(fields)

    return true
  } catch (error) {
    console.error('Erreur lors de l\'envoi vers Google Sheets:', error)
    return false
  }
}

/**
 * Soumet les donnees via un formulaire HTML cache dans un iframe
 * C'est la methode la plus fiable pour envoyer des donnees a Google Apps Script
 * car les soumissions de formulaire ne sont pas bloquees par CORS
 */
const submitViaIframe = (fields) => {
  // Creer un iframe invisible
  const iframe = document.createElement('iframe')
  iframe.name = 'olda_sheet_' + Date.now()
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  // Creer le formulaire
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = GOOGLE_SCRIPT_URL
  form.target = iframe.name

  // Ajouter chaque champ comme input hidden
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()

  // Nettoyage apres 15 secondes
  setTimeout(() => {
    if (form.parentNode) form.remove()
    if (iframe.parentNode) iframe.remove()
  }, 15000)
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
