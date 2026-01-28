import { useRef, useMemo } from 'react'
import ProductionStepper from './ProductionStepper'
import TshirtEditor from './TshirtEditor'
import { exportToPdf } from '../utils/pdfExport'

// Options de cibles
const TARGET_OPTIONS = [
  { value: 'H', label: 'Homme' },
  { value: 'F', label: 'Femme' },
  { value: 'E', label: 'Enfant' },
  { value: 'B', label: 'Bebe' }
]

// Generer les references automatiquement
const generateReferences = (prefix) => {
  const refs = []
  for (let i = 1; i <= 15; i++) {
    refs.push(`${prefix}${i.toString().padStart(3, '0')}`)
  }
  return refs
}

// Prix disponibles
const PRICE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100]

function FicheClient({ fiche, onUpdate, onValidate }) {
  const printRef = useRef(null)
  const editorRef = useRef(null)

  // Calculer les jours restants avant la deadline
  const daysRemaining = useMemo(() => {
    if (!fiche.deadline) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(fiche.deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    return diff
  }, [fiche.deadline])

  // Calculer le total
  const total = useMemo(() => {
    const tshirtTotal = (fiche.tshirtPrice || 0) * (fiche.quantity || 1)
    const personalizationTotal = (fiche.personalizationPrice || 0) * (fiche.quantity || 1)
    return tshirtTotal + personalizationTotal
  }, [fiche.tshirtPrice, fiche.personalizationPrice, fiche.quantity])

  // Obtenir les references disponibles pour la cible selectionnee
  const availableReferences = useMemo(() => {
    return fiche.target ? generateReferences(fiche.target) : []
  }, [fiche.target])

  // Exporter en PDF
  const handleExportPdf = async () => {
    // Clear canvas selection avant export
    if (editorRef.current) {
      editorRef.current.clearSelection()
    }

    if (printRef.current) {
      await exportToPdf(printRef.current, fiche.clientName || 'fiche')
    }
  }

  // Verifier si le formulaire est valide pour validation
  const canValidate = fiche.clientName && fiche.clientName !== 'Nouveau Client' && fiche.clientPhone

  return (
    <div className="animate-fade-in">
      {/* Fiche Container avec animation d'urgence */}
      <div
        ref={printRef}
        className={`
          card p-6 sm:p-8 transition-all duration-300
          ${fiche.isUrgent && !fiche.isValidated ? 'animate-pulse-urgent ring-4 ring-red-500/50' : ''}
          ${fiche.isValidated ? 'bg-stone-50' : ''}
        `}
      >
        {/* Header de la fiche */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900">
              {fiche.isValidated ? 'Fiche Validee' : 'OLDA Production'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Creee le {new Date(fiche.createdAt).toLocaleDateString('fr-FR')}
              {fiche.validatedAt && ` - Validee le ${new Date(fiche.validatedAt).toLocaleDateString('fr-FR')}`}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 no-print">
            {/* Bouton Urgence */}
            {!fiche.isValidated && (
              <button
                onClick={() => onUpdate({ isUrgent: !fiche.isUrgent })}
                className={`
                  px-3 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-200
                  ${fiche.isUrgent
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }
                `}
              >
                URGENT
              </button>
            )}

            {/* Bouton Export PDF */}
            <button
              onClick={handleExportPdf}
              className="px-3 sm:px-4 py-2 bg-stone-900 text-white rounded-full font-bold text-xs sm:text-sm
                         hover:bg-stone-800 transition-all duration-200
                         flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Stepper de Production (visible uniquement si valide) */}
        {fiche.isValidated && (
          <div className="mb-6">
            <ProductionStepper
              steps={fiche.productionSteps}
              onUpdateStep={(stepKey, value) => {
                onUpdate({
                  productionSteps: {
                    ...fiche.productionSteps,
                    [stepKey]: value
                  }
                })
              }}
            />
          </div>
        )}

        {/* Date limite */}
        <div className="flex items-center gap-3 p-3 bg-stone-100 rounded-xl mb-4">
          <span className="text-xs font-bold text-stone-500 uppercase whitespace-nowrap">Date limite</span>
          <input
            type="date"
            value={fiche.deadline}
            onChange={(e) => onUpdate({ deadline: e.target.value })}
            disabled={fiche.isValidated}
            className="flex-1 h-9 px-3 rounded-lg border border-stone-200 bg-white text-sm font-semibold
                       disabled:bg-stone-100 disabled:cursor-not-allowed"
          />
          {daysRemaining !== null && (
            <span className={`
              px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap
              ${daysRemaining <= 0
                ? 'bg-black text-white'
                : daysRemaining <= 3
                  ? 'bg-black text-white'
                  : 'bg-black text-white'
              }
            `}>
              {daysRemaining <= 0
                ? 'DEPASSE'
                : daysRemaining === 1
                  ? '1 jour'
                  : `${daysRemaining} jours`
              }
            </span>
          )}
        </div>

        {/* Informations Client */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Client</label>
            <input
              type="text"
              value={fiche.clientName}
              onChange={(e) => onUpdate({ clientName: e.target.value })}
              disabled={fiche.isValidated}
              className="input-field h-10 text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
              placeholder="Nom"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Telephone</label>
            <input
              type="tel"
              value={fiche.clientPhone}
              onChange={(e) => onUpdate({ clientPhone: e.target.value })}
              disabled={fiche.isValidated}
              className="input-field h-10 text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
              placeholder="06.."
            />
          </div>
        </div>

        {/* Cibles */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {TARGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdate({ target: option.value, reference: '' })}
              disabled={fiche.isValidated}
              className={`
                py-2 rounded-lg text-xs font-bold transition-all duration-200
                disabled:cursor-not-allowed
                ${fiche.target === option.value
                  ? 'bg-black text-white'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Reference et Taille */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Reference</label>
            <select
              value={fiche.reference}
              onChange={(e) => onUpdate({ reference: e.target.value })}
              disabled={fiche.isValidated || !fiche.target}
              className="input-field h-10 text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option value="">Selectionnez</option>
              {availableReferences.map((ref) => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
              <option value="MANUEL">MANUEL</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Taille</label>
            <select
              value={fiche.size || 'M'}
              onChange={(e) => onUpdate({ size: e.target.value })}
              disabled={fiche.isValidated}
              className="input-field h-10 text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option>XS</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
            </select>
          </div>
        </div>

        {/* Champ manuel si MANUEL selectionne */}
        {fiche.reference === 'MANUEL' && (
          <div className="mb-4">
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Reference manuelle</label>
            <input
              type="text"
              value={fiche.manualReference || ''}
              onChange={(e) => onUpdate({ manualReference: e.target.value })}
              disabled={fiche.isValidated}
              className="input-field h-10 text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
              placeholder="Entrez votre reference..."
            />
          </div>
        )}

        {/* Prix */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Prix T-Shirt</label>
            <select
              value={fiche.tshirtPrice || 25}
              onChange={(e) => onUpdate({ tshirtPrice: parseInt(e.target.value) })}
              disabled={fiche.isValidated}
              className="input-field h-10 text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              {PRICE_OPTIONS.map(p => (
                <option key={p} value={p}>{p} EUR</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Prix Perso.</label>
            <select
              value={fiche.personalizationPrice || 0}
              onChange={(e) => onUpdate({ personalizationPrice: parseInt(e.target.value) })}
              disabled={fiche.isValidated}
              className="input-field h-10 text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              {PRICE_OPTIONS.map(p => (
                <option key={p} value={p}>{p} EUR</option>
              ))}
            </select>
          </div>
        </div>

        {/* Editeur T-shirt avec Fabric.js */}
        <div className="border-t border-stone-200 pt-4 mt-4">
          <TshirtEditor
            ref={editorRef}
            disabled={fiche.isValidated}
            tshirtColor={fiche.tshirtColor || '#FFFFFF'}
            logoColor={fiche.logoColor || '#000000'}
            size={fiche.size || 'M'}
            onTshirtColorChange={(color) => onUpdate({ tshirtColor: color })}
            onLogoColorChange={(color) => onUpdate({ logoColor: color })}
            onSizeChange={(size) => onUpdate({ size })}
          />
        </div>

        {/* Recapitulatif et Total */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-stone-600">
              <span>T-Shirt</span>
              <span>{fiche.tshirtPrice || 25} EUR</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Personnalisation</span>
              <span>{fiche.personalizationPrice || 0} EUR</span>
            </div>
            <div className={`
              flex justify-between text-lg font-black pt-2 border-t border-stone-200
              ${fiche.isPaid ? 'text-green-600' : 'text-red-600'}
            `}>
              <span>TOTAL</span>
              <span>{total} EUR</span>
            </div>
          </div>

          {/* Statut Paiement */}
          <div className="flex justify-center gap-0 p-1 bg-stone-200 rounded-full">
            <button
              onClick={() => onUpdate({ isPaid: false })}
              className={`
                flex-1 py-3 rounded-full text-xs font-bold transition-all duration-200
                ${!fiche.isPaid
                  ? 'bg-red-500 text-white'
                  : 'bg-transparent text-stone-500 hover:text-stone-700'
                }
              `}
            >
              NON PAYE
            </button>
            <button
              onClick={() => onUpdate({ isPaid: true })}
              className={`
                flex-1 py-3 rounded-full text-xs font-bold transition-all duration-200
                ${fiche.isPaid
                  ? 'bg-green-500 text-white'
                  : 'bg-transparent text-stone-500 hover:text-stone-700'
                }
              `}
            >
              PAYE
            </button>
          </div>
        </div>

        {/* Bouton de validation */}
        {!fiche.isValidated && (
          <div className="mt-6 no-print">
            <button
              onClick={onValidate}
              disabled={!canValidate}
              className={`
                w-full py-4 rounded-2xl font-bold text-base transition-all duration-200
                ${canValidate
                  ? 'bg-black text-white hover:bg-stone-800 shadow-lg'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }
              `}
            >
              VALIDER ET TRANSMETTRE A L'ATELIER
            </button>
            {!canValidate && (
              <p className="text-xs text-stone-500 text-center mt-2">
                Remplissez le nom et le telephone pour valider
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FicheClient
