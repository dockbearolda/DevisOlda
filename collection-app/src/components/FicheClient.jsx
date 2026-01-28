import { useRef, useMemo, useState } from 'react'
import ProductionStepper from './ProductionStepper'
import TshirtEditor from './TshirtEditor'
import Modal from './Modal'
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
  const [showPdfModal, setShowPdfModal] = useState(false)

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

  // Verifier si le formulaire est valide pour validation
  const canValidate = fiche.clientName && fiche.clientName !== 'Nouveau Client' && fiche.clientPhone

  // Gerer le clic sur le bouton PDF
  const handlePdfClick = () => {
    if (!fiche.isValidated && canValidate) {
      setShowPdfModal(true)
    } else {
      generatePdf()
    }
  }

  // Generer et telecharger le PDF
  const generatePdf = async () => {
    if (editorRef.current) {
      editorRef.current.clearSelection()
    }

    if (printRef.current) {
      await exportToPdf(printRef.current, fiche.clientName || 'fiche')
    }
  }

  // Valider et generer PDF
  const handleValidateAndPdf = () => {
    onValidate()
    setTimeout(() => {
      generatePdf()
    }, 100)
  }

  // Verifier si la commande est terminee
  const isCompleted = fiche.isValidated && fiche.productionSteps?.completed

  return (
    <div className="animate-fade-in">
      {/* Fiche Container */}
      <div
        ref={printRef}
        className={`
          card p-6 sm:p-8 transition-all duration-500
          ${fiche.isUrgent && !fiche.isValidated ? 'animate-pulse-urgent ring-4 ring-red-500/50' : ''}
          ${isCompleted ? 'bg-green-50 border-2 border-green-400 shadow-lg shadow-green-200' : ''}
          ${fiche.isValidated && !isCompleted ? 'bg-stone-50' : ''}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {isCompleted ? 'COMMANDE TERMINEE' : fiche.isValidated ? 'FICHE VALIDEE' : 'OLDA Production'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {new Date(fiche.createdAt).toLocaleDateString('fr-FR')}
              {fiche.validatedAt && ` - Validee le ${new Date(fiche.validatedAt).toLocaleDateString('fr-FR')}`}
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            {/* Bouton Urgence - Gris/Noir sauf si actif */}
            {!fiche.isValidated && (
              <button
                onClick={() => onUpdate({ isUrgent: !fiche.isUrgent })}
                className={`
                  px-4 py-2 rounded-full font-bold text-xs transition-all duration-200
                  ${fiche.isUrgent
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }
                `}
              >
                URGENT
              </button>
            )}

            {/* Bouton PDF */}
            <button
              onClick={handlePdfClick}
              disabled={!canValidate && !fiche.isValidated}
              className={`
                px-4 py-2 rounded-full font-bold text-xs transition-all duration-200
                flex items-center gap-2
                ${canValidate || fiche.isValidated
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              GENERER PDF
            </button>
          </div>
        </div>

        {/* Stepper de Production */}
        {fiche.isValidated && (
          <div className="mb-6">
            <ProductionStepper
              steps={fiche.productionSteps}
              clientPhone={fiche.clientPhone}
              clientName={fiche.clientName}
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

        {/* Formulaire - Chaque champ sur sa ligne */}
        <div className="space-y-4">
          {/* Date limite */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Date limite</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={fiche.deadline}
                onChange={(e) => onUpdate({ deadline: e.target.value })}
                disabled={fiche.isValidated}
                className="flex-1 h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
              />
              {daysRemaining !== null && (
                <span className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-full">
                  {daysRemaining <= 0 ? 'DEPASSE' : daysRemaining === 1 ? '1 jour' : `${daysRemaining} jours`}
                </span>
              )}
            </div>
          </div>

          {/* Client */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Nom du client</label>
            <input
              type="text"
              value={fiche.clientName}
              onChange={(e) => onUpdate({ clientName: e.target.value })}
              disabled={fiche.isValidated}
              className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                         disabled:bg-stone-100 disabled:cursor-not-allowed"
              placeholder="Nom complet"
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Telephone</label>
            <input
              type="tel"
              value={fiche.clientPhone}
              onChange={(e) => onUpdate({ clientPhone: e.target.value })}
              disabled={fiche.isValidated}
              className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                         disabled:bg-stone-100 disabled:cursor-not-allowed"
              placeholder="06 00 00 00 00"
            />
          </div>

          {/* Cible */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Cible</label>
            <div className="grid grid-cols-4 gap-2">
              {TARGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ target: option.value, reference: '' })}
                  disabled={fiche.isValidated}
                  className={`
                    py-3 rounded-xl text-xs font-bold transition-all duration-200
                    disabled:cursor-not-allowed
                    ${fiche.target === option.value
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Reference</label>
            <select
              value={fiche.reference}
              onChange={(e) => onUpdate({ reference: e.target.value })}
              disabled={fiche.isValidated || !fiche.target}
              className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                         disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option value="">Selectionnez une reference</option>
              {availableReferences.map((ref) => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
              <option value="MANUEL">MANUEL</option>
            </select>
          </div>

          {/* Champ manuel */}
          {fiche.reference === 'MANUEL' && (
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Reference manuelle</label>
              <input
                type="text"
                value={fiche.manualReference || ''}
                onChange={(e) => onUpdate({ manualReference: e.target.value })}
                disabled={fiche.isValidated}
                className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="Entrez la reference"
              />
            </div>
          )}

          {/* Taille */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Taille</label>
            <select
              value={fiche.size || 'M'}
              onChange={(e) => onUpdate({ size: e.target.value })}
              disabled={fiche.isValidated}
              className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                         disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          {/* Prix T-Shirt */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Prix T-Shirt</label>
            <select
              value={fiche.tshirtPrice || 25}
              onChange={(e) => onUpdate({ tshirtPrice: parseInt(e.target.value) })}
              disabled={fiche.isValidated}
              className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                         disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              {PRICE_OPTIONS.map(p => (
                <option key={p} value={p}>{p} EUR</option>
              ))}
            </select>
          </div>

          {/* Prix Personnalisation */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Prix Personnalisation</label>
            <select
              value={fiche.personalizationPrice || 0}
              onChange={(e) => onUpdate({ personalizationPrice: parseInt(e.target.value) })}
              disabled={fiche.isValidated}
              className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                         disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              {PRICE_OPTIONS.map(p => (
                <option key={p} value={p}>{p} EUR</option>
              ))}
            </select>
          </div>
        </div>

        {/* Editeur T-shirt */}
        <div className="border-t border-stone-200 pt-6 mt-6">
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

        {/* Recapitulatif */}
        <div className="mt-6 pt-6 border-t border-stone-200">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-stone-600">
              <span>T-Shirt</span>
              <span className="font-semibold">{fiche.tshirtPrice || 25} EUR</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Personnalisation</span>
              <span className="font-semibold">{fiche.personalizationPrice || 0} EUR</span>
            </div>
            <div className={`
              flex justify-between text-xl font-black pt-3 border-t border-stone-200
              ${fiche.isPaid ? 'text-green-600' : 'text-red-600'}
            `}>
              <span>TOTAL</span>
              <span>{total} EUR</span>
            </div>
          </div>

          {/* Statut Paiement - Seul element avec couleur */}
          <div className="flex gap-0 p-1 bg-stone-100 rounded-full">
            <button
              onClick={() => onUpdate({ isPaid: false })}
              className={`
                flex-1 py-3 rounded-full text-xs font-bold transition-all duration-200
                ${!fiche.isPaid
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-transparent text-stone-400'
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
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-transparent text-stone-400'
                }
              `}
            >
              PAYE
            </button>
          </div>
        </div>

        {/* Bouton Validation - uniquement si non valide */}
        {!fiche.isValidated && (
          <div className="mt-6 no-print">
            <button
              onClick={onValidate}
              disabled={!canValidate}
              className={`
                w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200
                ${canValidate
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              VALIDER LA COMMANDE
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmation PDF */}
      <Modal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        onConfirm={handleValidateAndPdf}
        title="Generer le PDF"
        message="Cette action va valider la commande et generer le PDF. La fiche ne sera plus modifiable. Continuer ?"
        confirmText="Valider et generer"
        cancelText="Annuler"
      />
    </div>
  )
}

export default FicheClient
