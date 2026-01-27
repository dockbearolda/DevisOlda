import { useState, useCallback } from 'react'
import TabBar from './components/TabBar'
import FicheClient from './components/FicheClient'

// Genere un ID unique pour chaque fiche
const generateId = () => `fiche-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Cree une nouvelle fiche vide
const createEmptyFiche = (name = 'Nouveau Client') => ({
  id: generateId(),
  clientName: name,
  clientPhone: '',
  clientEmail: '',
  deadline: '',
  isUrgent: false,
  isValidated: false,
  isPaid: false,

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
  tshirtPrice: 0,
  personalizationPrice: 0,

  // Images/Logos
  frontLogo: null,
  backLogo: null,

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
  createdAt: new Date().toISOString(),
  validatedAt: null
})

function App() {
  const [fiches, setFiches] = useState([createEmptyFiche()])
  const [activeTabId, setActiveTabId] = useState(fiches[0].id)

  // Ajouter un nouvel onglet/fiche
  const handleAddTab = useCallback(() => {
    const newFiche = createEmptyFiche()
    setFiches(prev => [...prev, newFiche])
    setActiveTabId(newFiche.id)
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

  // Valider une fiche (la figer)
  const handleValidateFiche = useCallback((ficheId) => {
    setFiches(prev => prev.map(fiche => {
      if (fiche.id !== ficheId) return fiche
      return {
        ...fiche,
        isValidated: true,
        validatedAt: new Date().toISOString(),
        productionSteps: {
          ...fiche.productionSteps,
          validated: true
        }
      }
    }))
  }, [])

  // Obtenir la fiche active
  const activeFiche = fiches.find(f => f.id === activeTabId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
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
                  OLDA Collections
                </h1>
                <p className="text-xs text-stone-500 -mt-0.5">Gestion de Commandes</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-500">
                {fiches.length} fiche{fiches.length > 1 ? 's' : ''} en cours
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <TabBar
        fiches={fiches}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onAddTab={handleAddTab}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeFiche && (
          <FicheClient
            key={activeFiche.id}
            fiche={activeFiche}
            onUpdate={(updates) => handleUpdateFiche(activeFiche.id, updates)}
            onValidate={() => handleValidateFiche(activeFiche.id)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-stone-400">
            OLDA Production Master - Tous droits reserves
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
