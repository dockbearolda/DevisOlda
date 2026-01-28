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

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

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

  // Calcul dynamique des prix
  const prixTshirt = fiche.tshirtPrice || 0
  const prixPerso = fiche.personalizationPrice || 0
  const total = prixTshirt + prixPerso

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
      {/* Fiche Container - Optimisee pour A4 */}
      <div
        ref={printRef}
        className={`
          card p-5 sm:p-6 transition-all duration-500
          ${fiche.isUrgent && !fiche.isValidated ? 'animate-pulse-urgent ring-4 ring-red-500/50' : ''}
          ${isCompleted ? 'bg-green-50 border-2 border-green-400 shadow-lg shadow-green-200' : ''}
          ${fiche.isValidated && !isCompleted ? 'bg-stone-50' : ''}
        `}
      >
        {/* En-tete avec Date Figee */}
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-stone-200">
          <div>
            {/* Date de creation - Proeminente et figee */}
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {fiche.createdDateDisplay || formatDate(fiche.createdAt)}
              </span>
            </div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              {isCompleted ? 'COMMANDE TERMINEE' : fiche.isValidated ? 'FICHE VALIDEE' : 'Commande T-shirt OLDA'}
            </h2>
            {fiche.validatedAt && (
              <p className="text-xs text-stone-500 mt-0.5">
                Validee le {formatDate(fiche.validatedAt)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 no-print">
            {/* Bouton Urgence */}
            {!fiche.isValidated && (
              <button
                onClick={() => onUpdate({ isUrgent: !fiche.isUrgent })}
                className={`
                  px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-200
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
                px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-200
                flex items-center gap-1.5
                ${canValidate || fiche.isValidated
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        {/* Stepper de Production - Compact */}
        {fiche.isValidated && (
          <div className="mb-4">
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

        {/* Formulaire - Layout compact pour A4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Colonne 1 */}
          <div className="space-y-3">
            {/* Client */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Client</label>
              <input
                type="text"
                value={fiche.clientName}
                onChange={(e) => onUpdate({ clientName: e.target.value })}
                disabled={fiche.isValidated}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-semibold
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="Nom complet"
              />
            </div>

            {/* Telephone */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Telephone</label>
              <input
                type="tel"
                value={fiche.clientPhone}
                onChange={(e) => onUpdate({ clientPhone: e.target.value })}
                disabled={fiche.isValidated}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-semibold
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="06 00 00 00 00"
              />
            </div>

            {/* Cible */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Cible</label>
              <div className="grid grid-cols-4 gap-1">
                {TARGET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onUpdate({ target: option.value, reference: '' })}
                    disabled={fiche.isValidated}
                    className={`
                      py-2 rounded-lg text-xs font-bold transition-all duration-200
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
              <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Reference</label>
              <select
                value={fiche.reference}
                onChange={(e) => onUpdate({ reference: e.target.value })}
                disabled={fiche.isValidated || !fiche.target}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-semibold
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                <option value="">Selectionnez</option>
                {availableReferences.map((ref) => (
                  <option key={ref} value={ref}>{ref}</option>
                ))}
                <option value="MANUEL">MANUEL</option>
              </select>
            </div>

            {/* Champ manuel */}
            {fiche.reference === 'MANUEL' && (
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Ref. manuelle</label>
                <input
                  type="text"
                  value={fiche.manualReference || ''}
                  onChange={(e) => onUpdate({ manualReference: e.target.value })}
                  disabled={fiche.isValidated}
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-semibold
                             disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="Reference"
                />
              </div>
            )}
          </div>

          {/* Colonne 2 */}
          <div className="space-y-3">
            {/* Date limite */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Date limite</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fiche.deadline}
                  onChange={(e) => onUpdate({ deadline: e.target.value })}
                  disabled={fiche.isValidated}
                  className="flex-1 h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-semibold
                             disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
                {daysRemaining !== null && (
                  <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                    daysRemaining <= 0 ? 'bg-red-500 text-white' :
                    daysRemaining <= 3 ? 'bg-orange-500 text-white' :
                    'bg-stone-900 text-white'
                  }`}>
                    {daysRemaining <= 0 ? 'DEPASSE' : `${daysRemaining}j`}
                  </span>
                )}
              </div>
            </div>

            {/* Taille */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Taille</label>
              <select
                value={fiche.size || 'M'}
                onChange={(e) => onUpdate({ size: e.target.value })}
                disabled={fiche.isValidated}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-semibold
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

            {/* Section Calcul de Prix - Elegante */}
            <div className="bg-stone-50 rounded-xl p-3 space-y-2">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tarification</h3>

              {/* Prix T-Shirt */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-stone-600">Prix T-Shirt</label>
                <select
                  value={fiche.tshirtPrice || 25}
                  onChange={(e) => onUpdate({ tshirtPrice: parseInt(e.target.value) })}
                  disabled={fiche.isValidated}
                  className="w-24 h-8 px-2 rounded-lg border border-stone-200 bg-white text-sm font-bold text-right
                             disabled:bg-stone-100 disabled:cursor-not-allowed"
                >
                  {PRICE_OPTIONS.map(p => (
                    <option key={p} value={p}>{p} EUR</option>
                  ))}
                </select>
              </div>

              {/* Prix Personnalisation */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-stone-600">Personnalisation</label>
                <select
                  value={fiche.personalizationPrice || 0}
                  onChange={(e) => onUpdate({ personalizationPrice: parseInt(e.target.value) })}
                  disabled={fiche.isValidated}
                  className="w-24 h-8 px-2 rounded-lg border border-stone-200 bg-white text-sm font-bold text-right
                             disabled:bg-stone-100 disabled:cursor-not-allowed"
                >
                  {PRICE_OPTIONS.map(p => (
                    <option key={p} value={p}>{p} EUR</option>
                  ))}
                </select>
              </div>

              {/* Ligne de separation elegante */}
              <div className="border-t border-stone-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 uppercase tracking-wider">
                    {prixTshirt} + {prixPerso} =
                  </span>
                </div>
              </div>

              {/* Total - Mise en valeur */}
              <div className={`
                flex items-center justify-between py-2 px-3 rounded-lg
                ${fiche.isPaid ? 'bg-green-100' : 'bg-red-50'}
              `}>
                <span className={`text-lg font-black ${fiche.isPaid ? 'text-green-700' : 'text-red-600'}`}>
                  TOTAL
                </span>
                <span className={`text-2xl font-black tracking-tight ${fiche.isPaid ? 'text-green-700' : 'text-red-600'}`}>
                  {total} EUR
                </span>
              </div>

              {/* Statut Paiement */}
              <div className="flex gap-0 p-0.5 bg-stone-200 rounded-full mt-2">
                <button
                  onClick={() => onUpdate({ isPaid: false })}
                  className={`
                    flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200
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
                    flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200
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
          </div>
        </div>

        {/* Editeur T-shirt - Compact */}
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

        {/* Bouton Validation - uniquement si non valide */}
        {!fiche.isValidated && (
          <div className="mt-4 no-print">
            <button
              onClick={onValidate}
              disabled={!canValidate}
              className={`
                w-full py-3 rounded-xl font-bold text-sm transition-all duration-200
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
