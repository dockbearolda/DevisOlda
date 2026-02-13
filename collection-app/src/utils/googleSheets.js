// URL du Google Apps Script (à remplacer par votre URL de déploiement)
const GOOGLE_SCRIPT_URL = 'PLACEHOLDER_GOOGLE_SCRIPT_URL'

/**
 * Envoie une commande vers Google Sheets via fetch POST
 * @param {Object} order - Les données de la commande
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendToGoogleSheets = async (order) => {
  if (GOOGLE_SCRIPT_URL === 'PLACEHOLDER_GOOGLE_SCRIPT_URL') {
    console.warn('Google Script URL non configurée. Commande simulée.')
    return { success: true, message: 'Mode démo - URL non configurée' }
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(order),
    })

    // mode no-cors = opaque response, on ne peut pas lire le status
    // Mais si le fetch ne throw pas, c'est que la requête est partie
    return { success: true, message: 'Commande envoyée' }
  } catch (error) {
    console.error('Erreur envoi Google Sheets:', error)
    return { success: false, message: error.message }
  }
}
