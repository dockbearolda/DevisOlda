import { useState, useCallback, useEffect, useRef } from 'react'
import TabBar from './components/TabBar'
import FicheClient from './components/FicheClient'
import Dashboard from './components/Dashboard'
import { db } from './firebase'
import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore'

// Cle de stockage local
const STORAGE_KEY = 'olda_commandes'
const ARCHIVE_KEY = 'olda_archive'

// Genere un ID unique pour chaque fiche
const generateId = () => `fiche-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Formate la date en francais
const formatDateFr = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Cree une nouvelle fiche vide avec date figee
const createEmptyFiche = (name = '') => ({
  id: generateId(),
  clientName: name,
  clientPhone: '',
  phoneCountryCode: '590',
  clientEmail: '',
  deadline: '',
  isUrgent: false,
  isValidated: false,
  isPaid: false,

  // Date de creation figee
  createdAt: new Date().toISOString(),
  createdDateDisplay: formatDateFr(new Date()),

  // Cibles
  target: '',

  // References
  reference: '',
  manualReference: '',

  // Couleurs
  tshirtColor: '#FFFFFF',
  logoColor: '#000000',

  // Quantites et prix
  quantity: 1,
  tshirtPrice: 25,
  personalizationPrice: 0,

  // Images/Logos
  frontLogo: null,
  backLogo: null,
  frontLogoSize: 100,
  backLogoSize: 100,
  frontLogoPosition: null,
  backLogoPosition: null,

  // Taille
  size: 'M',

  // Notes
  notes: '',

  // Etapes de production (stepper)
  productionSteps: {
    validated: false,
    preparation: false,
    production: false,
    completed: false
  },

  // Metadata
  validatedAt: null
})

// Charger les donnees depuis localStorage
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erreur chargement localStorage:', e)
  }
  return [createEmptyFiche()]
}

// Charger l'archive depuis localStorage
const loadArchive = () => {
  try {
    const saved = localStorage.getItem(ARCHIVE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Erreur chargement archive:', e)
  }
  return []
}

// Ecrire un document Firestore (silencieux si pas de db)
const firestoreSet = (path, id, data) => {
  if (!db) return
  setDoc(doc(db, path, id), data).catch(e => console.warn('Firestore write error:', e.message))
}
const firestoreDel = (path, id) => {
  if (!db) return
  deleteDoc(doc(db, path, id)).catch(e => console.warn('Firestore delete error:', e.message))
}

function App() {
  const [fiches, setFiches] = useState(() => loadFromStorage())
  const [archive, setArchive] = useState(() => loadArchive())
  const [activeTabId, setActiveTabId] = useState(fiches[0]?.id || '')
  const [currentView, setCurrentView] = useState('commande') // 'commande', 'preparation', 'production', 'terminee', 'dashboard'
  const [firebaseReady, setFirebaseReady] = useState(false)
  const skipRemoteSync = useRef(false)

  // --- Firestore : chargement initial + ecoute temps reel ---
  useEffect(() => {
    if (!db) return

    const unsubFiches = onSnapshot(
      collection(db, 'fiches'),
      (snapshot) => {
        const remote = snapshot.docs.map(d => d.data())
        if (remote.length > 0) {
          skipRemoteSync.current = true
          setFiches(remote)
        }
        setFirebaseReady(true)
      },
      () => setFirebaseReady(true)
    )

    const unsubArchive = onSnapshot(
      collection(db, 'archive'),
      (snapshot) => {
        const remote = snapshot.docs.map(d => d.data())
        skipRemoteSync.current = true
        setArchive(remote)
      },
      () => {}
    )

    return () => { unsubFiches(); unsubArchive() }
  }, [])

  // Sauvegarder dans localStorage a chaque modification
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fiches))
    // Sync vers Firestore uniquement pour les changements locaux
    if (db && !skipRemoteSync.current) {
      fiches.forEach(f => firestoreSet('fiches', f.id, f))
    }
    skipRemoteSync.current = false
  }, [fiches])

  // Sauvegarder l'archive
  useEffect(() => {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive))
    if (db && !skipRemoteSync.current) {
      archive.forEach(f => firestoreSet('archive', f.id, f))
    }
    skipRemoteSync.current = false
  }, [archive])

  // Ajouter un nouvel onglet/fiche
  const handleAddTab = useCallback(() => {
    const newFiche = createEmptyFiche()
    setFiches(prev => [...prev, newFiche])
    setActiveTabId(newFiche.id)
    setCurrentView('commande')
  }, [])

  // Fermer un onglet (avec confirmation si non valide)
  const handleCloseTab = useCallback((ficheId) => {
    const fiche = fiches.find(f => f.id === ficheId)

    // Si la fiche n'est pas validee et a des donnees, demander confirmation
    if (fiche && !fiche.isValidated && (fiche.clientName || fiche.clientPhone)) {
      if (!window.confirm('Cette fiche contient des donnees non sauvegardees. Voulez-vous vraiment la fermer ?')) {
        return
      }
    }

    // Supprimer de Firestore
    firestoreDel('fiches', ficheId)

    setFiches(prev => {
      const newFiches = prev.filter(f => f.id !== ficheId)

      // S'il ne reste plus de fiches, en creer une nouvelle
      if (newFiches.length === 0) {
        const newFiche = createEmptyFiche()
        setActiveTabId(newFiche.id)
        return [newFiche]
      }

      // Si l'onglet ferme etait actif, activer le precedent ou le premier
      if (activeTabId === ficheId) {
        const closedIndex = prev.findIndex(f => f.id === ficheId)
        const newActiveIndex = Math.max(0, closedIndex - 1)
        setActiveTabId(newFiches[newActiveIndex].id)
      }

      return newFiches
    })
  }, [fiches, activeTabId])

  // Mettre a jour une fiche
  const handleUpdateFiche = useCallback((ficheId, updates) => {
    setFiches(prev => prev.map(fiche => {
      if (fiche.id !== ficheId) return fiche

      // Si la fiche est validee, seules certaines mises a jour sont autorisees
      if (fiche.isValidated) {
        const allowedUpdates = ['productionSteps', 'isPaid', 'frontLogoSize', 'backLogoSize', 'frontLogoPosition', 'backLogoPosition', 'isValidated']
        const filteredUpdates = Object.keys(updates)
          .filter(key => allowedUpdates.includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {})
        return { ...fiche, ...filteredUpdates }
      }

      return { ...fiche, ...updates }
    }))
  }, [])

  // Valider une fiche (la figer) et l'archiver automatiquement
  const handleValidateFiche = useCallback((ficheId) => {
    setFiches(prev => {
      const updatedFiches = prev.map(fiche => {
        if (fiche.id !== ficheId) return fiche
        const validatedFiche = {
          ...fiche,
          isValidated: true,
          validatedAt: new Date().toISOString(),
          productionSteps: {
            ...fiche.productionSteps,
            validated: true
          }
        }

        // Ajouter a l'archive
        setArchive(prevArchive => {
          // Verifier si deja archive
          const exists = prevArchive.some(f => f.id === ficheId)
          if (exists) {
            return prevArchive.map(f => f.id === ficheId ? validatedFiche : f)
          }
          return [validatedFiche, ...prevArchive]
        })

        return validatedFiche
      })
      return updatedFiches
    })
  }, [])

  // Mettre a jour l'archive quand une fiche change
  const syncArchive = useCallback((fiche) => {
    if (fiche.isValidated) {
      setArchive(prev => prev.map(f => f.id === fiche.id ? fiche : f))
    }
  }, [])

  // Charger une fiche depuis l'archive
  const handleLoadFromArchive = useCallback((ficheId) => {
    const archivedFiche = archive.find(f => f.id === ficheId)
    if (archivedFiche) {
      // Verifier si la fiche est deja ouverte
      const existingFiche = fiches.find(f => f.id === ficheId)
      if (existingFiche) {
        setActiveTabId(ficheId)
      } else {
        setFiches(prev => [...prev, archivedFiche])
        setActiveTabId(ficheId)
      }
      // Router vers la bonne vue selon l'etat de la fiche
      const f = archivedFiche
      if (f.isValidated && f.productionSteps?.completed) {
        setCurrentView('terminee')
      } else if (f.isValidated) {
        setCurrentView('production')
      } else {
        setCurrentView('commande')
      }
    }
  }, [archive, fiches])

  // Supprimer de l'archive
  const handleDeleteFromArchive = useCallback((ficheId) => {
    if (window.confirm('Supprimer definitivement cette commande de l\'archive ?')) {
      setArchive(prev => prev.filter(f => f.id !== ficheId))
      firestoreDel('archive', ficheId)
    }
  }, [])

  // Obtenir la fiche active
  const activeFiche = fiches.find(f => f.id === activeTabId)

  // Compteurs pour le flux logistique
  const commandesNonValidees = fiches.filter(f => !f.isValidated).length
  const enProduction = fiches.filter(f => f.isValidated && !f.productionSteps?.completed).length
  const terminees = fiches.filter(f => f.isValidated && f.productionSteps?.completed).length

  // Filtrer les fiches selon la vue actuelle
  const getFichesForView = () => {
    switch (currentView) {
      case 'commande':
        return fiches.filter(f => !f.isValidated)
      case 'production':
        return fiches.filter(f => f.isValidated && !f.productionSteps?.completed)
      case 'terminee':
        return fiches.filter(f => f.isValidated && f.productionSteps?.completed)
      default:
        return fiches
    }
  }

  const fichesForCurrentView = getFichesForView()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col pt-14">
      {/* Header - Fixe en haut */}
      <header className="bg-white border-b border-stone-200 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-center h-14 gap-3">
            {/* Navigation - Segments connectes */}
            <nav className="flex bg-stone-100 rounded-full p-1 flex-shrink-0">
              {[
                { key: 'commande', label: 'Commande', count: commandesNonValidees, activeClass: 'bg-stone-900 text-white shadow-md' },
                { key: 'production', label: 'Prod', count: enProduction, activeClass: 'bg-blue-500 text-white shadow-md' },
                { key: 'terminee', label: 'Terminé', count: terminees, activeClass: 'bg-emerald-500 text-white shadow-md' },
              ].map(({ key, label, count, activeClass }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key)}
                  className={`relative flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    currentView === key ? activeClass : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                      currentView === key ? 'bg-white/25 text-white' : 'bg-stone-300 text-stone-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Archive */}
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
                currentView === 'dashboard'
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-500 hover:text-stone-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {archive.length > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                  currentView === 'dashboard' ? 'bg-white/25 text-white' : 'bg-stone-300 text-stone-600'
                }`}>
                  {archive.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Vue Commande / Preparation / Production / Terminee */}
      {currentView !== 'dashboard' && (
        <>
          {/* Tab Bar - Affiche les fiches filtrees selon la vue */}
          <TabBar
            fiches={fichesForCurrentView}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onAddTab={currentView === 'commande' ? handleAddTab : null}
            viewLabel={
              currentView === 'commande' ? 'Nouvelles commandes' :
              currentView === 'production' ? 'En production' :
              'Commandes terminees'
            }
          />

          {/* Main Content */}
          <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {fichesForCurrentView.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
                  {currentView === 'commande' && (
                    <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {currentView === 'production' && (
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  {currentView === 'terminee' && (
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-serif font-semibold text-stone-700 mb-2">
                  {currentView === 'commande' && 'Aucune nouvelle commande'}
                  {currentView === 'production' && 'Aucune commande en production'}
                  {currentView === 'terminee' && 'Aucune commande terminee'}
                </h3>
                <p className="text-stone-500 mb-6">
                  {currentView === 'commande' && 'Cliquez sur "Nouvelle commande" pour creer une fiche'}
                  {currentView === 'production' && 'Les commandes validees passeront ici'}
                  {currentView === 'terminee' && 'Les commandes terminees seront listees ici'}
                </p>
                {currentView === 'commande' && (
                  <button
                    onClick={handleAddTab}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-semibold
                               hover:bg-stone-800 transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle commande
                  </button>
                )}
              </div>
            ) : activeFiche && fichesForCurrentView.some(f => f.id === activeTabId) ? (
              <FicheClient
                key={activeFiche.id}
                fiche={activeFiche}
                currentView={currentView}
                onUpdate={(updates) => {
                  const ficheId = activeFiche.id

                  handleUpdateFiche(ficheId, updates)
                  syncArchive({ ...activeFiche, ...updates })

                  // Auto-transition vers Commande si on desactive la validation (bouton modifier)
                  if (updates.isValidated === false && currentView === 'production') {
                    setTimeout(() => {
                      setCurrentView('commande')
                      setActiveTabId(ficheId)
                    }, 100)
                  }

                  // Auto-transition vers la vue suivante apres mise a jour des etapes
                  if (updates.productionSteps) {
                    const newSteps = { ...activeFiche.productionSteps, ...updates.productionSteps }

                    // Production terminee → Terminé
                    if (newSteps.completed && currentView === 'production') {
                      setTimeout(() => setCurrentView('terminee'), 400)
                    }
                  }
                }}
                onValidate={() => {
                  handleValidateFiche(activeFiche.id)
                  // Auto-transition vers Production apres validation
                  setTimeout(() => setCurrentView('production'), 400)
                }}
                onArchive={() => handleCloseTab(activeFiche.id)}
              />
            ) : fichesForCurrentView.length > 0 ? (
              // Auto-select first fiche in current view
              (() => {
                const firstFiche = fichesForCurrentView[0]
                if (firstFiche && activeTabId !== firstFiche.id) {
                  setTimeout(() => setActiveTabId(firstFiche.id), 0)
                }
                return null
              })()
            ) : null}
          </main>
        </>
      )}

      {/* Vue Dashboard/Archive */}
      {currentView === 'dashboard' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Dashboard
            archive={archive}
            onLoadFiche={handleLoadFromArchive}
            onDeleteFiche={handleDeleteFromArchive}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-stone-400">
            Commande T-shirt OLDA - Tous droits reserves
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
