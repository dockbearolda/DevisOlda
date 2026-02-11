import { storage } from '../firebase'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'

/**
 * Upload un mockup base64 vers Firebase Storage et retourne l'URL publique
 * @param {string} base64Data - Image en base64 (data:image/png;base64,...)
 * @param {string} ficheId - ID de la fiche pour nommer le fichier
 * @param {string} side - 'front' ou 'back'
 * @returns {Promise<string|null>} - URL publique de l'image ou null si echec
 */
export async function uploadMockup(base64Data, ficheId, side = 'front') {
  if (!storage || !base64Data) return null

  try {
    const fileName = `mockups/${ficheId}_${side}_${Date.now()}.png`
    const storageRef = ref(storage, fileName)
    await uploadString(storageRef, base64Data, 'data_url')
    const url = await getDownloadURL(storageRef)
    return url
  } catch (e) {
    console.warn('Erreur upload mockup vers Firebase Storage:', e.message)
    return null
  }
}

/**
 * Capture et upload les mockups front/back d'un TshirtEditor
 * @param {Object} editorRef - Ref vers le composant TshirtEditor
 * @param {string} ficheId - ID de la fiche
 * @returns {Promise<{frontUrl: string|null, backUrl: string|null}>}
 */
export async function captureAndUploadMockups(editorRef, ficheId) {
  if (!editorRef?.current?.captureMockup) {
    return { frontUrl: null, backUrl: null }
  }

  try {
    const { front, back } = await editorRef.current.captureMockup()

    const [frontUrl, backUrl] = await Promise.all([
      front ? uploadMockup(front, ficheId, 'front') : null,
      back ? uploadMockup(back, ficheId, 'back') : null
    ])

    // Si Firebase echoue (pas configure), retourner le base64 en fallback
    return {
      frontUrl: frontUrl || front || null,
      backUrl: backUrl || back || null
    }
  } catch (e) {
    console.warn('Erreur capture/upload mockups:', e.message)
    return { frontUrl: null, backUrl: null }
  }
}
