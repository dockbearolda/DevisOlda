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
    modalMessage: 'Le t-shirt a-t-il bien ete prepare ?'
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
      rounded-2xl p-6 border-2 transition-all duration-500
      ${isAllCompleted
        ? 'bg-green-50 border-green-400 shadow-lg shadow-green-200'
        : 'bg-stone-50 border-stone-200'
      }
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide">
          Suivi Production
        </h3>
        {isAllCompleted && (
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
            TERMINEE
          </span>
        )}
      </div>

      {/* Stepper horizontal */}
      <div className="relative mb-6">
        {/* Ligne de progression */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-stone-200 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isAllCompleted ? 'bg-green-500' : 'bg-stone-900'
            }`}
            style={{
              width: `${Math.max(0, (Object.values(steps).filter(Boolean).length - 1) / (PRODUCTION_STEPS.length - 1) * 100)}%`
            }}
          />
        </div>

        {/* Etapes */}
        <div className="relative flex justify-between">
          {PRODUCTION_STEPS.map((step, index) => {
            const isCompleted = steps[step.key]
            const isCurrent = index === currentStepIndex
            const canToggle = !step.locked && (
              (index === 0 || steps[PRODUCTION_STEPS[index - 1].key]) || isCompleted
            )

            return (
              <div key={step.key} className="flex flex-col items-center" style={{ width: '80px' }}>
                <button
                  onClick={() => canToggle && handleStepClick(step, isCompleted)}
                  disabled={!canToggle}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 z-10 text-sm font-bold
                    ${isCompleted
                      ? isAllCompleted
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-stone-900 text-white shadow-md'
                      : isCurrent
                        ? 'bg-white border-2 border-stone-900 text-stone-900'
                        : 'bg-white border-2 border-stone-300 text-stone-400'
                    }
                    ${canToggle ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>

                <span className={`
                  mt-2 text-xs font-semibold text-center
                  ${isCompleted
                    ? isAllCompleted ? 'text-green-700' : 'text-stone-900'
                    : 'text-stone-500'
                  }
                `}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="space-y-3">
        {!isAllCompleted && currentStepIndex > 0 && (
          <button
            onClick={() => handleStepClick(PRODUCTION_STEPS[currentStepIndex], false)}
            className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl
                       hover:bg-stone-800 transition-all duration-200"
          >
            {currentStepIndex === 1 && 'PREPARER'}
            {currentStepIndex === 2 && 'TERMINER PRODUCTION'}
            {currentStepIndex === 3 && 'FINALISER'}
          </button>
        )}

        {isAllCompleted && (
          <div className="space-y-3">
            <div className="text-center py-3 bg-green-100 text-green-800 font-bold rounded-xl">
              Commande prete pour livraison
            </div>

            {clientPhone && (
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl
                           hover:bg-green-700 transition-all duration-200
                           flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                ENVOYER MESSAGE WHATSAPP
              </button>
            )}
          </div>
        )}
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
