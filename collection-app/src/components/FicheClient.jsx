import { useRef, useMemo, useState, useEffect } from 'react'
import ProductionStepper from './ProductionStepper'
import TshirtEditor, { TshirtSvgFront, TshirtSvgBack, TSHIRT_COLORS, LOGO_COLORS } from './TshirtEditor'
import Modal from './Modal'
import { exportToPdf } from '../utils/pdfExport'
import { captureAndUploadMockups } from '../utils/mockupUpload'

// Options de collections (anciennement cibles/categories)
const COLLECTION_OPTIONS = [
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

// Prix T-shirt (1 a 100 par 1)
const TSHIRT_PRICE_OPTIONS = Array.from({ length: 100 }, (_, i) => i + 1)

// Prix personnalisation (0 a 100 par 5)
const PERSO_PRICE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

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

// Formater la date courte
const formatDateShort = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function FicheClient({ fiche, onUpdate, onValidate, onArchive, currentView }) {
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

  // Obtenir les references disponibles pour la collection selectionnee
  const availableReferences = useMemo(() => {
    return fiche.target ? generateReferences(fiche.target) : []
  }, [fiche.target])

  // Verifier si le formulaire est valide pour validation
  const canValidate = fiche.clientName && fiche.clientPhone

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

  // Capturer le mockup et valider
  const handleValidateWithMockup = async () => {
    const { frontUrl } = await captureAndUploadMockups(editorRef, fiche.id)
    onValidate(frontUrl || null)
  }

  // Valider et generer PDF
  const handleValidateAndPdf = async () => {
    const { frontUrl } = await captureAndUploadMockups(editorRef, fiche.id)
    onValidate(frontUrl || null)
    setTimeout(() => {
      generatePdf()
    }, 100)
  }

  // Verifier si la commande est terminee
  const isCompleted = fiche.isValidated && fiche.productionSteps?.completed

  // Helper: nom de la collection
  const getCollectionLabel = (target) => {
    const col = COLLECTION_OPTIONS.find(c => c.value === target)
    return col ? col.label : ''
  }

  // Helper: nom de la couleur
  const getColorLabel = (hex, list) => {
    const c = list.find(item => item.value === hex)
    return c ? c.label : hex
  }

  // Helper: reference affichee
  const displayReference = fiche.reference === 'MANUEL'
    ? (fiche.manualReference || 'Manuel')
    : (fiche.reference || '—')

  // ============================================================
  // VUE PRODUCTION — Fiche Atelier Studio
  // ============================================================
  if (currentView === 'production') {
    const tshirtColorLabel = getColorLabel(fiche.tshirtColor || '#FFFFFF', TSHIRT_COLORS)
    const logoColorLabel = getColorLabel(fiche.logoColor || '#000000', LOGO_COLORS)

    return (
      <div className="view-slide-enter">
        <div ref={printRef} className="max-w-3xl mx-auto">

          {/* Fiche Atelier */}
          <div className={`bg-white rounded-3xl ring-1 ring-stone-200 overflow-hidden ${
            fiche.isUrgent ? 'animate-pulse-urgent ring-4 ring-red-500/50' : ''
          }`}>

            {/* En-tete Studio */}
            <div className="border-b border-stone-100 px-8 sm:px-12 py-8 text-center relative">
              {/* Bouton Modifier (crayon) en haut à droite */}
              <button
                onClick={() => onUpdate({ isValidated: false })}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600
                           hover:bg-stone-100 rounded-full transition-all duration-200 no-print"
                title="Modifier la commande"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.3em] mb-3">
                Fiche Atelier
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {fiche.clientName || 'Client'}
              </h2>
              <div className="flex items-center justify-center gap-3 mt-3">
                {fiche.target && (
                  <span className="text-sm font-medium text-stone-500">
                    {getCollectionLabel(fiche.target)}
                  </span>
                )}
                {fiche.target && displayReference !== '—' && (
                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                )}
                {displayReference !== '—' && (
                  <span className="text-sm font-medium text-stone-500">
                    {displayReference}
                  </span>
                )}
                {fiche.size && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span className="text-sm font-medium text-stone-500">
                      Taille {fiche.size}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Visuels — Logo Avant / Logo Arriere */}
            <div className="px-8 sm:px-12 py-10">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.3em] mb-8 text-center">
                Visuels de Production
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Logo Avant */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">
                    Avant
                  </p>
                  <div className="relative w-[220px] h-[260px] bg-gradient-to-br from-stone-50 to-stone-100
                                  rounded-2xl ring-1 ring-stone-200 overflow-hidden">
                    <TshirtSvgFront color={fiche.tshirtColor || '#FFFFFF'} />
                    {fiche.frontLogo ? (
                      <div
                        className="absolute z-10 flex items-center justify-center"
                        style={fiche.frontLogoPosition ? {
                          left: `${fiche.frontLogoPosition.position.x * (220/300)}px`,
                          top: `${fiche.frontLogoPosition.position.y * (260/350)}px`,
                          width: `${fiche.frontLogoPosition.size.width * (220/300)}px`,
                          height: `${fiche.frontLogoPosition.size.height * (260/350)}px`
                        } : {
                          left: '50%',
                          top: '45%',
                          transform: 'translate(-50%, -50%)',
                          width: `${Math.min(fiche.frontLogoSize || 100, 130)}px`,
                          height: `${Math.min(fiche.frontLogoSize || 100, 130)}px`
                        }}
                      >
                        {fiche.frontLogo.startsWith('data:') ? (
                          <img
                            src={fiche.frontLogo}
                            alt="Logo avant"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span
                            className="font-black text-center leading-none"
                            style={{
                              color: fiche.logoColor || '#000000',
                              fontSize: fiche.frontLogoPosition
                                ? `${Math.min(fiche.frontLogoPosition.size.width * (220/300) * 0.35, 36)}px`
                                : `${Math.min((fiche.frontLogoSize || 100) * 0.25, 28)}px`
                            }}
                          >
                            {fiche.frontLogo}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 border border-dashed border-stone-300 rounded-lg
                                        flex items-center justify-center">
                          <span className="text-[9px] text-stone-400 font-medium uppercase tracking-wider">
                            Logo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Arriere */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">
                    Arrière
                  </p>
                  <div className="relative w-[220px] h-[260px] bg-gradient-to-br from-stone-50 to-stone-100
                                  rounded-2xl ring-1 ring-stone-200 overflow-hidden">
                    <TshirtSvgBack color={fiche.tshirtColor || '#FFFFFF'} />
                    {fiche.backLogo ? (
                      <div
                        className="absolute z-10 flex items-center justify-center"
                        style={fiche.backLogoPosition ? {
                          left: `${fiche.backLogoPosition.position.x * (220/300)}px`,
                          top: `${fiche.backLogoPosition.position.y * (260/350)}px`,
                          width: `${fiche.backLogoPosition.size.width * (220/300)}px`,
                          height: `${fiche.backLogoPosition.size.height * (260/350)}px`
                        } : {
                          left: '50%',
                          top: '45%',
                          transform: 'translate(-50%, -50%)',
                          width: `${Math.min(fiche.backLogoSize || 100, 150)}px`,
                          height: `${Math.min(fiche.backLogoSize || 100, 150)}px`
                        }}
                      >
                        {fiche.backLogo.startsWith('data:') ? (
                          <img
                            src={fiche.backLogo}
                            alt="Logo arriere"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span
                            className="font-black text-center leading-none"
                            style={{
                              color: fiche.logoColor || '#000000',
                              fontSize: fiche.backLogoPosition
                                ? `${Math.min(fiche.backLogoPosition.size.width * (220/300) * 0.35, 40)}px`
                                : `${Math.min((fiche.backLogoSize || 100) * 0.3, 32)}px`
                            }}
                          >
                            {fiche.backLogo}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-20 h-20 border border-dashed border-stone-300 rounded-lg
                                        flex items-center justify-center">
                          <span className="text-[9px] text-stone-400 font-medium uppercase tracking-wider">
                            Logo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Couleurs de Production */}
            <div className="border-t border-stone-100 px-8 sm:px-12 py-8">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.3em] mb-6 text-center">
                Couleurs de Production
              </p>

              <div className="flex items-center justify-center gap-12">
                {/* Couleur T-shirt */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-full ring-1 ring-stone-200 shadow-inner"
                    style={{ backgroundColor: fiche.tshirtColor || '#FFFFFF' }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                      T-Shirt
                    </p>
                    <p className="text-xs font-medium text-stone-700 mt-0.5">
                      {tshirtColorLabel}
                    </p>
                  </div>
                </div>

                {/* Separateur */}
                <div className="w-px h-16 bg-stone-200" />

                {/* Couleur Logo */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-full ring-1 ring-stone-200 shadow-inner"
                    style={{ backgroundColor: fiche.logoColor || '#000000' }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                      Logo
                    </p>
                    <p className="text-xs font-medium text-stone-700 mt-0.5">
                      {logoColorLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper + Actions de Production */}
            <div className="border-t border-stone-100 px-8 sm:px-12 py-8">
              <ProductionStepper
                steps={fiche.productionSteps}
                clientPhone={fiche.clientPhone}
                clientName={fiche.clientName}
                phoneCountryCode={fiche.phoneCountryCode}
                onGeneratePdf={generatePdf}
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in pt-2">
      {/* Fiche Container - Optimisee pour A4 */}
      <div
        ref={printRef}
        className={`
          card p-6 sm:p-8 transition-all duration-500
          ${fiche.isUrgent && !fiche.isValidated ? 'animate-pulse-urgent ring-4 ring-red-500/50' : ''}
          ${isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-xl shadow-green-100' : ''}
          ${fiche.isValidated && !isCompleted ? 'bg-stone-50' : ''}
        `}
      >
        {/* ============================================ */}
        {/* EN-TETE: Date figee + Titre + Actions */}
        {/* ============================================ */}
        <div className="mb-6">
          {/* Date de creation + Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-stone-500">
                {fiche.createdAt ? formatDateShort(fiche.createdAt) : (fiche.createdDateDisplay || '')}
              </span>
            </div>

            {/* Actions - No Print */}
            <div className="flex items-center gap-2 no-print">
              {/* Bouton Urgence */}
              {!fiche.isValidated && (
                <button
                  onClick={() => onUpdate({ isUrgent: !fiche.isUrgent })}
                  className={`
                    px-4 py-2 rounded-full font-bold text-xs tracking-wider transition-all duration-200
                    ${fiche.isUrgent
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
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
                  px-4 py-2 rounded-full font-bold text-xs tracking-wider transition-all duration-200
                  flex items-center gap-2
                  ${canValidate || fiche.isValidated
                    ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-md'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
            </div>
          </div>

          {/* Titre de la fiche */}
          <div className="text-center pb-4 border-b border-stone-200">
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              {isCompleted ? 'COMMANDE TERMINEE' : fiche.isValidated ? 'FICHE VALIDEE' : 'Commande T-shirt OLDA'}
            </h2>
            {fiche.validatedAt && (
              <p className="text-sm text-stone-500 mt-1">
                Validee le {formatDate(fiche.validatedAt)}
              </p>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* STEPPER DE PRODUCTION - Haut de gamme */}
        {/* ============================================ */}
        {fiche.isValidated && (
          <div className="mb-6">
            <ProductionStepper
              steps={fiche.productionSteps}
              clientPhone={fiche.clientPhone}
              clientName={fiche.clientName}
              phoneCountryCode={fiche.phoneCountryCode}
              onGeneratePdf={generatePdf}
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

        {/* ============================================ */}
        {/* FORMULAIRE PRINCIPAL */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Colonne Gauche - Informations Client */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
              Informations Client
            </h3>

            {/* Client */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                Nom du client
              </label>
              <input
                type="text"
                value={fiche.clientName}
                onChange={(e) => onUpdate({ clientName: e.target.value })}
                disabled={fiche.isValidated}
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white text-base font-medium
                           focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent
                           disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
                placeholder="Nom complet"
              />
            </div>

            {/* Telephone */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                Telephone
              </label>
              <div className="flex gap-2 overflow-hidden">
                <select
                  value={fiche.phoneCountryCode || '33'}
                  onChange={(e) => onUpdate({ phoneCountryCode: e.target.value })}
                  disabled={fiche.isValidated}
                  className="shrink-0 w-24 h-12 px-2 rounded-xl border border-stone-200 bg-white text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent
                             disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
                >
                  <option value="590">🇲🇫 +590</option>
                  <option value="590">🇬🇵 +590</option>
                  <option value="596">🇲🇶 +596</option>
                  <option value="594">🇬🇫 +594</option>
                  <option value="1721">🇸🇽 +1721</option>
                  <option value="33">🇫🇷 +33</option>
                  <option value="1">🇺🇸 +1</option>
                  <option value="44">🇬🇧 +44</option>
                  <option value="49">🇩🇪 +49</option>
                  <option value="34">🇪🇸 +34</option>
                  <option value="39">🇮🇹 +39</option>
                  <option value="32">🇧🇪 +32</option>
                  <option value="41">🇨🇭 +41</option>
                  <option value="352">🇱🇺 +352</option>
                  <option value="212">🇲🇦 +212</option>
                  <option value="216">🇹🇳 +216</option>
                  <option value="213">🇩🇿 +213</option>
                </select>
                <input
                  type="tel"
                  value={fiche.clientPhone}
                  onChange={(e) => onUpdate({ clientPhone: e.target.value })}
                  disabled={fiche.isValidated}
                  className="flex-1 min-w-0 h-12 px-4 rounded-xl border-2 border-stone-200 bg-white text-base font-medium
                             focus:outline-none focus:border-stone-900
                             disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
                  placeholder="06 00 00 00 00"
                />
              </div>
            </div>

            {/* Collection (anciennement Cible) */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                Collection
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLLECTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onUpdate({ target: option.value, reference: '' })}
                    disabled={fiche.isValidated}
                    className={`
                      py-3 rounded-xl text-sm font-bold transition-all duration-200
                      disabled:cursor-not-allowed
                      ${fiche.target === option.value
                        ? 'bg-stone-900 text-white shadow-lg'
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
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                Reference
              </label>
              <select
                value={fiche.reference}
                onChange={(e) => onUpdate({ reference: e.target.value })}
                disabled={fiche.isValidated || !fiche.target}
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white text-base font-medium
                           focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent
                           disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
              >
                <option value="">Selectionnez une reference</option>
                {availableReferences.map((ref) => (
                  <option key={ref} value={ref}>{ref}</option>
                ))}
                <option value="MANUEL">Reference manuelle</option>
              </select>
            </div>

            {/* Champ manuel */}
            {fiche.reference === 'MANUEL' && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                  Reference manuelle
                </label>
                <input
                  type="text"
                  value={fiche.manualReference || ''}
                  onChange={(e) => onUpdate({ manualReference: e.target.value })}
                  disabled={fiche.isValidated}
                  className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white text-base font-medium
                             focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent
                             disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
                  placeholder="Entrez la reference"
                />
              </div>
            )}
          </div>

          {/* Colonne Droite - Details Commande */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
              Details de la Commande
            </h3>

            {/* Date limite et Jours restants - MEME LIGNE */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                Echeance
              </label>
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="flex-1 min-w-0">
                  <input
                    type="date"
                    value={fiche.deadline}
                    onChange={(e) => onUpdate({ deadline: e.target.value })}
                    disabled={fiche.isValidated}
                    className="w-full max-w-[200px] h-12 px-4 rounded-xl border border-stone-200 bg-white text-base font-medium
                               focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent
                               disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                {daysRemaining !== null && (
                  <div className={`
                    flex items-center justify-center h-12 px-5 rounded-xl text-base font-bold
                    ${daysRemaining <= 0
                      ? 'bg-red-500 text-white'
                      : daysRemaining <= 3
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-900 text-white'
                    }
                  `}>
                    {daysRemaining <= 0 ? 'DEPASSE' : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`}
                  </div>
                )}
              </div>
            </div>

            {/* Taille */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                Taille
              </label>
              <select
                value={fiche.size || 'M'}
                onChange={(e) => onUpdate({ size: e.target.value })}
                disabled={fiche.isValidated}
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white text-base font-medium
                           focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent
                           disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* EDITEUR T-SHIRT */}
        {/* ============================================ */}
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
            logoFront={fiche.frontLogo}
            logoBack={fiche.backLogo}
            onLogoFrontChange={(logo) => onUpdate({ frontLogo: logo })}
            onLogoBackChange={(logo) => onUpdate({ backLogo: logo })}
            logoFrontPosition={fiche.frontLogoPosition}
            logoBackPosition={fiche.backLogoPosition}
            onLogoFrontPositionChange={(pos) => onUpdate({ frontLogoPosition: pos })}
            onLogoBackPositionChange={(pos) => onUpdate({ backLogoPosition: pos })}
          />
        </div>

        {/* ============================================ */}
        {/* PIED DE PAGE: Tarification + Total + Validation */}
        {/* ============================================ */}
        <div className="border-t border-stone-200 pt-6 mt-6">
          {/* Section Tarification */}
          <div className="bg-stone-50 rounded-2xl p-5 space-y-4 mb-4">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Tarification
            </h4>

            {/* Prix T-Shirt */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-stone-600">Prix T-Shirt</label>
              <select
                value={fiche.tshirtPrice || 25}
                onChange={(e) => onUpdate({ tshirtPrice: parseInt(e.target.value) })}
                disabled={fiche.isValidated}
                className="w-28 h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-bold text-right
                           focus:outline-none focus:ring-2 focus:ring-stone-900
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                {TSHIRT_PRICE_OPTIONS.map(p => (
                  <option key={p} value={p}>{p} EUR</option>
                ))}
              </select>
            </div>

            {/* Prix Personnalisation */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-stone-600">Personnalisation</label>
              <select
                value={fiche.personalizationPrice || 0}
                onChange={(e) => onUpdate({ personalizationPrice: parseInt(e.target.value) })}
                disabled={fiche.isValidated}
                className="w-28 h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm font-bold text-right
                           focus:outline-none focus:ring-2 focus:ring-stone-900
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                {PERSO_PRICE_OPTIONS.map(p => (
                  <option key={p} value={p}>{p} EUR</option>
                ))}
              </select>
            </div>

            {/* Formule */}
            <div className="text-center py-2 border-t border-stone-200">
              <span className="text-sm text-stone-400 font-medium tracking-wide">
                {prixTshirt} EUR + {prixPerso} EUR
              </span>
            </div>

            {/* Statut Paiement */}
            <div className="flex p-1 bg-stone-200 rounded-full">
              <button
                onClick={() => onUpdate({ isPaid: false })}
                className={`
                  flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200
                  ${!fiche.isPaid
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-transparent text-stone-400'
                  }
                `}
              >
                Non paye
              </button>
              <button
                onClick={() => onUpdate({ isPaid: true })}
                className={`
                  flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200
                  ${fiche.isPaid
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-transparent text-stone-400'
                  }
                `}
              >
                Paye
              </button>
            </div>
          </div>

          {/* Total - Tout en bas, mis en valeur */}
          <div className={`
            flex items-center justify-between p-5 rounded-2xl mb-4
            ${fiche.isPaid
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-red-500 to-rose-500'
            }
          `}>
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${fiche.isPaid ? 'bg-white/20' : 'bg-white/20'}
              `}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {fiche.isPaid ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                  Total a payer
                </p>
                <p className="text-white text-xs">
                  {fiche.isPaid ? 'Reglement effectue' : 'En attente de reglement'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-4xl font-black tracking-tight">
                {total} EUR
              </p>
            </div>
          </div>

          {/* Bouton Validation - uniquement si non valide */}
          {!fiche.isValidated && (
            <button
              onClick={handleValidateWithMockup}
              disabled={!canValidate}
              className={`
                w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-200 no-print
                ${canValidate
                  ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-xl hover:shadow-2xl'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              Valider la Commande
            </button>
          )}
        </div>
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
