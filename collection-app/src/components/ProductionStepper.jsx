import { useState } from 'react'
import Modal from './Modal'

// Etapes de production avec leur configuration
const PRODUCTION_STEPS = [
  {
    key: 'validated',
    label: 'Validee',
    description: 'Commande confirmee',
    locked: true
  },
  {
    key: 'preparation',
    label: 'Preparation',
    description: 'Materiaux prets',
    modalTitle: 'Confirmation Preparation',
    modalMessage: 'Preparation du t-shirt terminee ?'
  },
  {
    key: 'production',
    label: 'Production',
    description: 'En fabrication',
    modalTitle: 'Confirmation Production',
    modalMessage: "L'etiquette a-t-elle ete retiree sur le produit ?"
  },
  {
    key: 'completed',
    label: 'Terminee',
    description: 'Prete a livrer',
    modalTitle: 'Finalisation',
    modalMessage: 'Confirmer que la commande est terminee et prete pour le client ?'
  }
]

function ProductionStepper({ steps, onUpdateStep, clientPhone, clientName }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, step: null })

  // Determiner l'etape courante
  const currentStepIndex = PRODUCTION_STEPS.findIndex(step => !steps[step.key])
  const isAllCompleted = currentStepIndex === -1
  const completedCount = Object.values(steps).filter(Boolean).length

  // Gerer le clic sur une etape
  const handleStepClick = (step, isCompleted) => {
    if (step.locked) return

    // Si deja complete, on peut decocher directement
    if (isCompleted) {
      onUpdateStep(step.key, false)
      return
    }

    // Sinon, ouvrir la modale de confirmation
    setModalConfig({ isOpen: true, step })
  }

  // Confirmer l'etape
  const handleConfirm = () => {
    if (modalConfig.step) {
      onUpdateStep(modalConfig.step.key, true)
    }
  }

  // Envoyer un message WhatsApp
  const handleWhatsApp = () => {
    if (!clientPhone) return
    const phone = clientPhone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Bonjour ${clientName || ''},\n\nVotre commande OLDA est prete ! Vous pouvez venir la recuperer.\n\nMerci de votre confiance.`
    )
    window.open(`https://wa.me/33${phone.startsWith('0') ? phone.slice(1) : phone}?text=${message}`, '_blank')
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl transition-all duration-700
      ${isAllCompleted
        ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
        : 'bg-gradient-to-br from-stone-50 via-white to-stone-50'
      }
    `}>
      {/* Bordure fine elegante */}
      <div className={`
        absolute inset-0 rounded-2xl pointer-events-none
        ${isAllCompleted
          ? 'ring-1 ring-inset ring-emerald-300'
          : 'ring-1 ring-inset ring-stone-200'
        }
      `} />

      {/* Accent dore subtil en haut */}
      <div className={`
        absolute top-0 left-0 right-0 h-px
        ${isAllCompleted
          ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
          : 'bg-gradient-to-r from-transparent via-amber-300 to-transparent'
        }
      `} />

      <div className="relative p-6">
        {/* Header - Style haut de gamme */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-[0.2em] mb-1">
              Suivi de Production
            </h3>
            <p className="text-sm text-stone-500">
              {completedCount} / {PRODUCTION_STEPS.length} etapes
            </p>
          </div>
          {isAllCompleted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-semibold uppercase tracking-wider">
                Complete
              </span>
            </div>
          )}
        </div>

        {/* Stepper Horizontal - Design luxueux */}
        <div className="relative mb-8">
          {/* Ligne de progression - Fine et elegante */}
          <div className="absolute top-6 left-6 right-6 h-px bg-stone-200" />

          {/* Ligne de progression active - Avec gradient dore */}
          <div
            className="absolute top-6 left-6 h-px transition-all duration-1000 ease-out"
            style={{
              width: `calc(${Math.max(0, (completedCount - 1) / (PRODUCTION_STEPS.length - 1) * 100)}% - 48px)`,
              background: isAllCompleted
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #292524, #78716c)'
            }}
          />

          {/* Etapes */}
          <div className="relative flex justify-between">
            {PRODUCTION_STEPS.map((step, index) => {
              const isCompleted = steps[step.key]
              const isCurrent = index === currentStepIndex
              const canToggle = !step.locked && (
                (index === 0 || steps[PRODUCTION_STEPS[index - 1].key]) || isCompleted
              )

              return (
                <div key={step.key} className="flex flex-col items-center group" style={{ width: '80px' }}>
                  {/* Cercle de l'etape */}
                  <button
                    onClick={() => canToggle && handleStepClick(step, isCompleted)}
                    disabled={!canToggle}
                    className={`
                      relative w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-500 z-10
                      ${isCompleted
                        ? isAllCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200'
                          : 'bg-gradient-to-br from-stone-700 to-stone-900 shadow-lg shadow-stone-300'
                        : isCurrent
                          ? 'bg-white shadow-lg shadow-stone-200 ring-2 ring-stone-900'
                          : 'bg-white shadow-md ring-1 ring-stone-200'
                      }
                      ${canToggle ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'cursor-default'}
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`
                        text-sm font-semibold
                        ${isCurrent ? 'text-stone-900' : 'text-stone-400'}
                      `}>
                        {index + 1}
                      </span>
                    )}

                    {/* Effet de brillance subtil */}
                    {isCompleted && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                    )}
                  </button>

                  {/* Label de l'etape */}
                  <div className="mt-3 text-center">
                    <span className={`
                      text-xs font-semibold tracking-wide
                      ${isCompleted
                        ? isAllCompleted ? 'text-emerald-700' : 'text-stone-800'
                        : isCurrent
                          ? 'text-stone-700'
                          : 'text-stone-400'
                      }
                    `}>
                      {step.label}
                    </span>
                    <p className={`
                      text-[10px] mt-0.5 tracking-wide
                      ${isCompleted ? 'text-stone-500' : 'text-stone-400'}
                    `}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions - Style raffine */}
        <div className="space-y-3">
          {!isAllCompleted && currentStepIndex > 0 && (
            <button
              onClick={() => handleStepClick(PRODUCTION_STEPS[currentStepIndex], false)}
              className="w-full py-3.5 bg-stone-900 text-white font-semibold text-sm uppercase tracking-widest rounded-xl
                         hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5"
            >
              {currentStepIndex === 1 && 'Marquer comme prepare'}
              {currentStepIndex === 2 && 'Terminer la production'}
              {currentStepIndex === 3 && 'Finaliser la commande'}
            </button>
          )}

          {isAllCompleted && (
            <div className="space-y-3">
              {/* Message de succes elegant */}
              <div className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-100 to-teal-100
                              text-emerald-800 font-semibold rounded-xl ring-1 ring-inset ring-emerald-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Commande prete pour livraison
              </div>

              {/* Bouton WhatsApp - Design premium */}
              {clientPhone && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                             font-semibold text-sm uppercase tracking-widest rounded-xl
                             hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5
                             flex items-center justify-center gap-3 no-print"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Notifier le client
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, step: null })}
        onConfirm={handleConfirm}
        title={modalConfig.step?.modalTitle || 'Confirmation'}
        message={modalConfig.step?.modalMessage || 'Confirmer cette action ?'}
      />
    </div>
  )
}

export default ProductionStepper
