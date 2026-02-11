import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
}

let db = null
let storage = null

try {
  if (firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    if (firebaseConfig.storageBucket) {
      storage = getStorage(app)
    }
  }
} catch (e) {
  console.warn('Firebase non configure, mode localStorage uniquement:', e.message)
}

export { db, storage }
