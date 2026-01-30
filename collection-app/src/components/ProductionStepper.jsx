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
      relative overflow-hidden rounded-xl transition-all duration-700
      ${isAllCompleted
        ? 'bg-gradient-to-br from-stone-50 via-white to-stone-50'
        : 'bg-gradient-to-br from-stone-50 via-white to-stone-50'
      }
    `}>
      {/* Bordure ultra-fine */}
      <div className={`
        absolute inset-0 rounded-xl pointer-events-none
        ${isAllCompleted
          ? 'ring-1 ring-inset ring-stone-200'
          : 'ring-1 ring-inset ring-stone-100'
        }
      `} />

      {/* Accent vert electrique en haut quand complete */}
      <div className={`
        absolute top-0 left-0 right-0 h-px transition-all duration-500
        ${isAllCompleted
          ? 'bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-80'
          : 'bg-gradient-to-r from-transparent via-stone-300 to-transparent opacity-50'
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
            <div className="flex items-center gap-2 px-4 py-2"
                 style={{ backgroundColor: '#00FF66' }}>
              <div className="w-2 h-2 bg-stone-900 rounded-full animate-pulse" />
              <span className="text-stone-900 text-[10px] font-bold uppercase tracking-[0.2em]">
                Complète
              </span>
            </div>
          )}
        </div>

        {/* Stepper Horizontal - Design Haute Couture */}
        <div className="relative mb-8">
          {/* Ligne de connexion - Presque invisible */}
          <div className="absolute top-6 left-6 right-6 h-px bg-stone-100" />

          {/* Ligne de progression active - Ultra fine */}
          <div
            className="absolute top-6 left-6 h-px transition-all duration-1000 ease-out"
            style={{
              width: `calc(${Math.max(0, (completedCount - 1) / (PRODUCTION_STEPS.length - 1) * 100)}% - 48px)`,
              background: isAllCompleted
                ? 'linear-gradient(90deg, #00FF66, #22c55e)'
                : 'linear-gradient(90deg, #a8a29e, #d6d3d1)'
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
                  {/* Cercle de l'etape - Haute Couture */}
                  <button
                    onClick={() => canToggle && handleStepClick(step, isCompleted)}
                    disabled={!canToggle}
                    className={`
                      relative w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-500 z-10
                      ${isCompleted
                        ? 'shadow-electric-glow'
                        : isCurrent
                          ? 'animate-glow-pulse'
                          : 'ring-1 ring-stone-200'
                      }
                      ${canToggle ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                    `}
                    style={
                      isCompleted
                        ? { backgroundColor: '#00FF66' }
                        : isCurrent
                          ? { backgroundColor: '#00FF66' }
                          : { backgroundColor: 'white' }
                    }
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`
                        text-sm font-bold
                        ${isCurrent ? 'text-stone-900' : 'text-stone-400'}
                      `}>
                        {index + 1}
                      </span>
                    )}

                    {/* Halo lumineux pour etape active */}
                    {isCurrent && !isCompleted && (
                      <div className="absolute -inset-1 rounded-full bg-[#00FF66]/30 blur-sm -z-10" />
                    )}
                  </button>

                  {/* Label de l'etape - Typographie raffinee */}
                  <div className="mt-3 text-center">
                    <span className={`
                      text-[11px] font-semibold tracking-wide uppercase
                      ${isCompleted
                        ? 'text-stone-800'
                        : isCurrent
                          ? 'text-stone-900 font-bold'
                          : 'text-stone-400'
                      }
                    `}>
                      {step.label}
                    </span>
                    <p className={`
                      text-[9px] mt-0.5 tracking-wide
                      ${isCompleted || isCurrent ? 'text-stone-500' : 'text-stone-300'}
                    `}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions - Boutons Haute Couture */}
        <div className="space-y-4">
          {!isAllCompleted && currentStepIndex > 0 && (
            <button
              onClick={() => handleStepClick(PRODUCTION_STEPS[currentStepIndex], false)}
              className="w-full py-4 bg-stone-900 text-white font-semibold text-xs uppercase tracking-[0.25em]
                         hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5"
              style={{ borderRadius: '0' }}
            >
              {currentStepIndex === 1 && 'MARQUER COMME PRÉPARÉ'}
              {currentStepIndex === 2 && 'TERMINER LA PRODUCTION'}
              {currentStepIndex === 3 && 'FINALISER LA COMMANDE'}
            </button>
          )}

          {isAllCompleted && (
            <div className="space-y-4">
              {/* Message de succes - Vert electrique */}
              <div className="flex items-center justify-center gap-3 py-4 text-stone-800 font-semibold"
                   style={{
                     background: 'linear-gradient(90deg, rgba(0,255,102,0.15), rgba(34,197,94,0.15))',
                     borderRadius: '0'
                   }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: '#00FF66' }}>
                  <svg className="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs uppercase tracking-[0.2em]">Commande prête pour livraison</span>
              </div>

              {/* Bouton WhatsApp - Style minimal */}
              {clientPhone && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-4 text-white font-semibold text-xs uppercase tracking-[0.25em]
                             hover:opacity-90 transition-all duration-300
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5
                             flex items-center justify-center gap-3 no-print"
                  style={{
                    backgroundColor: '#00FF66',
                    color: '#0a0a0a',
                    borderRadius: '0'
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  NOTIFIER LE CLIENT
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
