// URL du script Google Apps Script pour l'integration Google Sheets
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBYqbZrbsApXUlhEen03AiI0_BwRNJlydTl5d1VSHiYB80n8yrwifBRF_4j7oHti3-/exec"

/**
 * Formate un numero de telephone en format local (supprime prefixe international)
 * Exemples: +33612345678 → 0612345678, +590690123456 → 0690123456
 * @param {string} phone - Le numero de telephone brut
 * @returns {string} - Le numero en format local commencant par 0
 */
export const formatLocalPhone = (phone) => {
  if (!phone) return ''
  // Nettoyer tout sauf les chiffres et le +
  let cleaned = phone.replace(/[^\d+]/g, '')
  // Supprimer tout prefixe international (+33, +590, +596, +594, +1721, +1, +44, etc.)
  cleaned = cleaned.replace(/^\+?\d{1,4}(?=\d{9,10}$)/, '')
  // S'assurer que le numero commence par 0
  if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned
  }
  return cleaned
}

/**
 * Envoie les donnees d'une commande vers Google Sheets
 * @param {Object} fiche - Les donnees de la fiche client
 * @param {string} [mockupUrl] - URL du mockup visuel (optionnel)
 * @returns {Promise<boolean>} - true si succes, false sinon
 */
export const sendToGoogleSheets = async (fiche, mockupUrl) => {
  try {
    // Construire le numero de telephone complet puis le convertir en local
    const fullPhone = `+${fiche.phoneCountryCode || '590'}${(fiche.clientPhone || '').replace(/\D/g, '').replace(/^0/, '')}`
    const localPhone = formatLocalPhone(fullPhone)

    // Calculer le Total TTC
    const prixTshirt = fiche.tshirtPrice || 0
    const prixPerso = fiche.personalizationPrice || 0
    const totalTTC = prixTshirt + prixPerso

    // Preparer les donnees selon le format attendu par le script Apps Script
    // Colonnes: A=date(auto) B=client C=tel D=collection E=reference F=echeance
    //           G=taille H=couleurTshirt I=couleurLogo J=logoAvant K=logoArriere
    //           L=prixTshirt M=prixPerso N=total O=paye P=design
    const data = {
      client: fiche.clientName || '',
      tel: localPhone,
      collection: getCollectionName(fiche.target),
      reference: getModelReference(fiche),
      echeance: formatDeadline(fiche.deadline),
      taille: fiche.size || 'M',
      couleurTshirt: getTshirtColorName(fiche.tshirtColor),
      couleurLogo: getLogoColorName(fiche.logoColor),
      logoAvant: fiche.frontLogo ? 'Oui' : 'Non',
      logoArriere: fiche.backLogo ? 'Oui' : 'Non',
      prixTshirt: `${prixTshirt} EUR`,
      prixPerso: `${prixPerso} EUR`,
      total: `${totalTTC} EUR`,
      paye: fiche.isPaid ? 'Oui' : 'Non',
      design: mockupUrl || ''
    }

    console.log('Envoi vers Google Sheets:', { ...data, design: data.design ? '(image base64)' : '' })

    // Envoyer via POST avec champs individuels (formulaire cache + iframe)
    const iframe = document.createElement('iframe')
    iframe.name = 'gsheets-' + Date.now()
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = GOOGLE_SCRIPT_URL
    form.target = iframe.name

    // Ajouter chaque champ comme input hidden individuel
    for (const [key, value] of Object.entries(data)) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    }

    document.body.appendChild(form)
    form.submit()

    // Nettoyer form + iframe apres 30s
    setTimeout(() => {
      if (form.parentNode) form.parentNode.removeChild(form)
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }, 30000)

    console.log('Donnees envoyees vers Google Sheets via POST')
    return true

  } catch (error) {
    console.error('Erreur lors de l\'envoi vers Google Sheets:', error)
    return false
  }
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
 * Obtient le nom lisible de la couleur T-shirt (mappage complet depuis TshirtEditor)
 */
const getTshirtColorName = (hex) => {
  const colors = {
    '#FFFFFF': 'Blanc Pure',
    '#1A1A1A': 'Noir Deep',
    '#FDFD96': 'Jaune Pastel',
    '#FFD1DC': 'Rose Pastel',
    '#B3E5FC': 'Bleu Ciel',
    '#C1E1C1': 'Vert Menthe',
    '#E6E6FA': 'Lavande',
    '#FFDAB9': 'Peche',
    '#F5F5DC': 'Beige',
    '#B0E0E6': 'Bleu Poudre',
    '#F08080': 'Corail Douce',
    '#D3D3D3': 'Gris Clair',
    '#FAF0E6': 'Lin',
    '#FFF5EE': 'Coquillage',
    '#F0FFFF': 'Azure'
  }
  return colors[hex] || hex || ''
}

/**
 * Obtient le nom lisible de la couleur Logo (mappage complet depuis TshirtEditor)
 */
const getLogoColorName = (hex) => {
  const colors = {
    '#000000': 'Noir',
    '#FFFFFF': 'Blanc',
    '#FF3B30': 'Rouge Apple',
    '#007AFF': 'Bleu Apple',
    '#34C759': 'Vert Apple',
    '#FFCC00': 'Or / Jaune',
    '#AF52DE': 'Violet',
    '#5856D6': 'Indigo',
    '#FF9500': 'Orange',
    '#A2845E': 'Bronze',
    '#8E8E93': 'Gris',
    '#C0C0C0': 'Argent',
    '#FF2D55': 'Rose Flash',
    '#5AC8FA': 'Bleu Cyan',
    '#000080': 'Marine',
    '#556B2F': 'Olive'
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
