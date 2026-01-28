import { useState, useCallback, useEffect } from 'react'
import TabBar from './components/TabBar'
import FicheClient from './components/FicheClient'
import Dashboard from './components/Dashboard'

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
const createEmptyFiche = (name = 'Nouveau Client') => ({
  id: generateId(),
  clientName: name,
  clientPhone: '',
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

function App() {
  const [fiches, setFiches] = useState(() => loadFromStorage())
  const [archive, setArchive] = useState(() => loadArchive())
  const [activeTabId, setActiveTabId] = useState(fiches[0]?.id || '')
  const [currentView, setCurrentView] = useState('fiches') // 'fiches' ou 'dashboard'

  // Sauvegarder dans localStorage a chaque modification
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fiches))
  }, [fiches])

  // Sauvegarder l'archive
  useEffect(() => {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive))
  }, [archive])

  // Ajouter un nouvel onglet/fiche
  const handleAddTab = useCallback(() => {
    const newFiche = createEmptyFiche()
    setFiches(prev => [...prev, newFiche])
    setActiveTabId(newFiche.id)
    setCurrentView('fiches')
  }, [])

  // Fermer un onglet (avec confirmation si non valide)
  const handleCloseTab = useCallback((ficheId) => {
    const fiche = fiches.find(f => f.id === ficheId)

    // Si la fiche n'est pas validee et a des donnees, demander confirmation
    if (fiche && !fiche.isValidated && (fiche.clientName !== 'Nouveau Client' || fiche.clientPhone)) {
      if (!window.confirm('Cette fiche contient des donnees non sauvegardees. Voulez-vous vraiment la fermer ?')) {
        return
      }
    }

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
        const allowedUpdates = ['productionSteps', 'isPaid']
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
      setCurrentView('fiches')
    }
  }, [archive, fiches])

  // Supprimer de l'archive
  const handleDeleteFromArchive = useCallback((ficheId) => {
    if (window.confirm('Supprimer definitivement cette commande de l\'archive ?')) {
      setArchive(prev => prev.filter(f => f.id !== ficheId))
    }
  }, [])

  // Obtenir la fiche active
  const activeFiche = fiches.find(f => f.id === activeTabId)

  // Compteurs pour le header
  const fichesEnCours = fiches.filter(f => !f.isValidated).length
  const fichesValidees = fiches.filter(f => f.isValidated).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">
                  Commande T-shirt OLDA
                </h1>
                <p className="text-xs text-stone-500 -mt-0.5">Gestion des Commandes</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  onClick={() => setCurrentView('fiches')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'fiches'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Fiches ({fiches.length})
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'dashboard'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Archive ({archive.length})
                </button>
              </nav>

              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full">
                  {fichesEnCours} en cours
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  {fichesValidees} validees
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Vue Fiches */}
      {currentView === 'fiches' && (
        <>
          {/* Tab Bar */}
          <TabBar
            fiches={fiches}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onAddTab={handleAddTab}
          />

          {/* Main Content */}
          <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {activeFiche && (
              <FicheClient
                key={activeFiche.id}
                fiche={activeFiche}
                onUpdate={(updates) => {
                  handleUpdateFiche(activeFiche.id, updates)
                  syncArchive({ ...activeFiche, ...updates })
                }}
                onValidate={() => handleValidateFiche(activeFiche.id)}
              />
            )}
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
