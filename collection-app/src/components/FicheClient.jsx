import { useRef, useMemo } from 'react'
import ProductionStepper from './ProductionStepper'
import { exportToPdf } from '../utils/pdfExport'

// Options de cibles
const TARGET_OPTIONS = [
  { value: 'H', label: 'Homme' },
  { value: 'F', label: 'Femme' },
  { value: 'E', label: 'Enfant' },
  { value: 'B', label: 'Bebe' }
]

// Options de references par cible
const REFERENCES = {
  H: ['H-001', 'H-002', 'H-003', 'H-004', 'H-005'],
  F: ['F-001', 'F-002', 'F-003', 'F-004', 'F-005'],
  E: ['E-001', 'E-002', 'E-003', 'E-004', 'E-005'],
  B: ['B-001', 'B-002', 'B-003', 'B-004', 'B-005']
}

// Couleurs de t-shirt disponibles
const TSHIRT_COLORS = [
  { value: '#FFFFFF', label: 'Blanc' },
  { value: '#000000', label: 'Noir' },
  { value: '#1F2937', label: 'Gris fonce' },
  { value: '#9CA3AF', label: 'Gris clair' },
  { value: '#1E40AF', label: 'Bleu marine' },
  { value: '#DC2626', label: 'Rouge' },
  { value: '#16A34A', label: 'Vert' },
  { value: '#FBBF24', label: 'Jaune' }
]

function FicheClient({ fiche, onUpdate, onValidate }) {
  const printRef = useRef(null)

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
    return fiche.target ? REFERENCES[fiche.target] || [] : []
  }, [fiche.target])

  // Gerer le changement de fichier (logo)
  const handleFileChange = (side) => (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdate({ [`${side}Logo`]: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Gerer la suppression d'un logo
  const handleRemoveLogo = (side) => () => {
    onUpdate({ [`${side}Logo`]: null })
  }

  // Exporter en PDF
  const handleExportPdf = async () => {
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
          card p-8 transition-all duration-300
          ${fiche.isUrgent && !fiche.isValidated ? 'animate-pulse-urgent ring-4 ring-red-500/50' : ''}
          ${fiche.isValidated ? 'bg-stone-50' : ''}
        `}
      >
        {/* Header de la fiche */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-stone-900">
              {fiche.isValidated ? 'Fiche Validee' : 'Nouvelle Commande'}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Creee le {new Date(fiche.createdAt).toLocaleDateString('fr-FR')}
              {fiche.validatedAt && ` - Validee le ${new Date(fiche.validatedAt).toLocaleDateString('fr-FR')}`}
            </p>
          </div>

          <div className="flex items-center gap-3 no-print">
            {/* Bouton Urgence */}
            {!fiche.isValidated && (
              <button
                onClick={() => onUpdate({ isUrgent: !fiche.isUrgent })}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${fiche.isUrgent
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }
                `}
              >
                {fiche.isUrgent ? 'URGENT' : 'Marquer Urgent'}
              </button>
            )}

            {/* Badge Urgence pour PDF */}
            {fiche.isUrgent && (
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full print-only hidden">
                URGENT
              </span>
            )}

            {/* Bouton Export PDF */}
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg font-medium text-sm
                         hover:bg-stone-800 transition-all duration-200
                         flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Telecharger PDF
            </button>
          </div>
        </div>

        {/* Stepper de Production (visible uniquement si valide) */}
        {fiche.isValidated && (
          <div className="mb-8">
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

        {/* Formulaire */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne Gauche - Informations Client */}
          <div className="space-y-6">
            <SectionTitle>Informations Client</SectionTitle>

            {/* Nom du client */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Nom du client *
              </label>
              <input
                type="text"
                value={fiche.clientName}
                onChange={(e) => onUpdate({ clientName: e.target.value })}
                disabled={fiche.isValidated}
                className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="Ex: Mme Martin"
              />
            </div>

            {/* Telephone */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Telephone *
              </label>
              <input
                type="tel"
                value={fiche.clientPhone}
                onChange={(e) => onUpdate({ clientPhone: e.target.value })}
                disabled={fiche.isValidated}
                className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="06 12 34 56 78"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={fiche.clientEmail}
                onChange={(e) => onUpdate({ clientEmail: e.target.value })}
                disabled={fiche.isValidated}
                className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="client@email.com"
              />
            </div>

            {/* Date limite */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Date limite de livraison
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={fiche.deadline}
                  onChange={(e) => onUpdate({ deadline: e.target.value })}
                  disabled={fiche.isValidated}
                  className="input-field flex-1 disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
                {daysRemaining !== null && (
                  <span className={`
                    px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                    ${daysRemaining <= 0
                      ? 'bg-red-100 text-red-800'
                      : daysRemaining <= 3
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }
                  `}>
                    {daysRemaining <= 0
                      ? 'Depasse'
                      : daysRemaining === 1
                        ? '1 jour'
                        : `${daysRemaining} jours`
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Notes / Instructions speciales
              </label>
              <textarea
                value={fiche.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                disabled={fiche.isValidated}
                rows={3}
                className="input-field resize-none disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="Instructions particulieres pour l'atelier..."
              />
            </div>
          </div>

          {/* Colonne Droite - Details Commande */}
          <div className="space-y-6">
            <SectionTitle>Details de la Commande</SectionTitle>

            {/* Cible */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Cible
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onUpdate({ target: option.value, reference: '' })}
                    disabled={fiche.isValidated}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      disabled:cursor-not-allowed
                      ${fiche.target === option.value
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:hover:bg-stone-200'
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
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Reference
              </label>
              <div className="flex flex-col gap-3">
                <select
                  value={fiche.reference}
                  onChange={(e) => onUpdate({ reference: e.target.value })}
                  disabled={fiche.isValidated || !fiche.target}
                  className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selectionnez une reference</option>
                  {availableReferences.map((ref) => (
                    <option key={ref} value={ref}>{ref}</option>
                  ))}
                  <option value="manual">Saisie manuelle</option>
                </select>

                {fiche.reference === 'manual' && (
                  <input
                    type="text"
                    value={fiche.manualReference}
                    onChange={(e) => onUpdate({ manualReference: e.target.value })}
                    disabled={fiche.isValidated}
                    className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
                    placeholder="Entrez la reference manuellement"
                  />
                )}
              </div>
            </div>

            {/* Couleur du T-shirt */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Couleur du T-shirt
              </label>
              <div className="flex flex-wrap gap-2">
                {TSHIRT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onUpdate({ tshirtColor: color.value })}
                    disabled={fiche.isValidated}
                    title={color.label}
                    className={`
                      w-10 h-10 rounded-lg border-2 transition-all duration-200
                      disabled:cursor-not-allowed
                      ${fiche.tshirtColor === color.value
                        ? 'ring-2 ring-offset-2 ring-stone-900'
                        : 'hover:scale-110'
                      }
                    `}
                    style={{
                      backgroundColor: color.value,
                      borderColor: color.value === '#FFFFFF' ? '#e5e7eb' : color.value
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quantite */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Quantite
              </label>
              <input
                type="number"
                min="1"
                value={fiche.quantity}
                onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
                disabled={fiche.isValidated}
                className="input-field w-32 disabled:bg-stone-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Prix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Prix T-shirt (EUR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fiche.tshirtPrice}
                  onChange={(e) => onUpdate({ tshirtPrice: parseFloat(e.target.value) || 0 })}
                  disabled={fiche.isValidated}
                  className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Prix Perso. (EUR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fiche.personalizationPrice}
                  onChange={(e) => onUpdate({ personalizationPrice: parseFloat(e.target.value) || 0 })}
                  disabled={fiche.isValidated}
                  className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Upload Logos */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <SectionTitle>Logos / Visuels</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Logo Avant */}
            <LogoUpload
              label="Logo Avant"
              logo={fiche.frontLogo}
              disabled={fiche.isValidated}
              onUpload={handleFileChange('front')}
              onRemove={handleRemoveLogo('front')}
            />

            {/* Logo Arriere */}
            <LogoUpload
              label="Logo Arriere"
              logo={fiche.backLogo}
              disabled={fiche.isValidated}
              onUpload={handleFileChange('back')}
              onRemove={handleRemoveLogo('back')}
            />
          </div>
        </div>

        {/* Recapitulatif et Total */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Total */}
            <div className="bg-stone-100 rounded-xl p-6 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600">Sous-total T-shirts</span>
                <span className="font-medium">
                  {((fiche.tshirtPrice || 0) * (fiche.quantity || 1)).toFixed(2)} EUR
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-stone-600">Sous-total Personnalisation</span>
                <span className="font-medium">
                  {((fiche.personalizationPrice || 0) * (fiche.quantity || 1)).toFixed(2)} EUR
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-stone-300">
                <span className="text-lg font-semibold text-stone-900">Total</span>
                <span className="text-2xl font-bold text-stone-900">{total.toFixed(2)} EUR</span>
              </div>
            </div>

            {/* Statut Paiement */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-stone-700">Statut du paiement</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ isPaid: false })}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${!fiche.isPaid
                      ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }
                  `}
                >
                  Non paye
                </button>
                <button
                  onClick={() => onUpdate({ isPaid: true })}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${fiche.isPaid
                      ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }
                  `}
                >
                  Paye
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de validation */}
        {!fiche.isValidated && (
          <div className="mt-8 pt-6 border-t border-stone-200 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-stone-500">
                Une fois validee, la fiche sera figee et transmise a l'atelier.
              </p>
              <button
                onClick={onValidate}
                disabled={!canValidate}
                className={`
                  px-8 py-3 rounded-lg font-semibold text-base transition-all duration-200
                  ${canValidate
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }
                `}
              >
                Valider et transmettre a l'atelier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant titre de section
function SectionTitle({ children }) {
  return (
    <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
      <span className="w-1 h-6 bg-stone-900 rounded-full"></span>
      {children}
    </h3>
  )
}

// Composant Upload de Logo
function LogoUpload({ label, logo, disabled, onUpload, onRemove }) {
  const inputRef = useRef(null)

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-stone-700">{label}</label>

      {logo ? (
        <div className="relative group">
          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
            <img
              src={logo}
              alt={label}
              className="w-full h-full object-contain"
            />
          </div>
          {!disabled && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={`
            w-full aspect-square rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3
            transition-all duration-200
            ${disabled
              ? 'border-stone-200 bg-stone-50 cursor-not-allowed'
              : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50 cursor-pointer'
            }
          `}
        >
          <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-stone-500">
            {disabled ? 'Upload desactive' : 'Cliquez pour ajouter'}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        disabled={disabled}
        className="hidden"
      />
    </div>
  )
}

export default FicheClient
