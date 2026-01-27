// Etapes de production avec leur configuration
const PRODUCTION_STEPS = [
  {
    key: 'validated',
    label: 'Commande Validee',
    description: 'La commande client est confirmee',
    locked: true // Cette etape est cochee automatiquement
  },
  {
    key: 'preparation',
    label: 'Preparation',
    description: 'Preparation des materiaux et du design'
  },
  {
    key: 'production',
    label: 'Production',
    description: 'Fabrication en cours'
  },
  {
    key: 'completed',
    label: 'Terminee',
    description: 'Commande prete a etre livree'
  }
]

function ProductionStepper({ steps, onUpdateStep }) {
  // Determiner l'etape courante (la premiere non completee)
  const currentStepIndex = PRODUCTION_STEPS.findIndex(step => !steps[step.key])

  return (
    <div className="bg-gradient-to-r from-stone-100 to-stone-50 rounded-xl p-6 border border-stone-200">
      <h3 className="text-lg font-semibold text-stone-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Suivi de Production
      </h3>

      <div className="relative">
        {/* Ligne de progression */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-stone-300">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{
              width: `${(Object.values(steps).filter(Boolean).length - 1) / (PRODUCTION_STEPS.length - 1) * 100}%`
            }}
          />
        </div>

        {/* Etapes */}
        <div className="relative flex justify-between">
          {PRODUCTION_STEPS.map((step, index) => {
            const isCompleted = steps[step.key]
            const isCurrent = index === currentStepIndex
            const canToggle = !step.locked && (
              // Peut cocher si l'etape precedente est completee
              (index === 0 || steps[PRODUCTION_STEPS[index - 1].key]) ||
              // Peut decocher si deja coche
              isCompleted
            )

            return (
              <StepItem
                key={step.key}
                step={step}
                index={index}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                canToggle={canToggle}
                onToggle={() => {
                  if (canToggle) {
                    onUpdateStep(step.key, !isCompleted)
                  }
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Message de progression */}
      <div className="mt-6 pt-4 border-t border-stone-200">
        {currentStepIndex === -1 ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Commande terminee et prete pour livraison</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-stone-600">
            <svg className="w-5 h-5 animate-pulse text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Etape en cours : <strong>{PRODUCTION_STEPS[currentStepIndex].label}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour une etape individuelle
function StepItem({ step, index, isCompleted, isCurrent, canToggle, onToggle }) {
  return (
    <div className="flex flex-col items-center" style={{ width: '120px' }}>
      {/* Cercle de l'etape */}
      <button
        onClick={onToggle}
        disabled={!canToggle}
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-300 z-10
          ${isCompleted
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
            : isCurrent
              ? 'bg-white border-2 border-stone-900 text-stone-900 shadow-lg'
              : 'bg-white border-2 border-stone-300 text-stone-400'
          }
          ${canToggle && !step.locked
            ? 'cursor-pointer hover:scale-110 active:scale-95'
            : step.locked
              ? 'cursor-not-allowed'
              : 'cursor-not-allowed opacity-60'
          }
        `}
        title={step.locked ? 'Cette etape est verrouilee' : isCompleted ? 'Cliquez pour annuler' : 'Cliquez pour valider'}
      >
        {isCompleted ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="font-bold text-lg">{index + 1}</span>
        )}

        {/* Animation pulse pour l'etape courante */}
        {isCurrent && !isCompleted && (
          <span className="absolute inset-0 rounded-full border-2 border-stone-900 animate-ping opacity-30" />
        )}
      </button>

      {/* Label de l'etape */}
      <div className="mt-3 text-center">
        <p className={`
          text-sm font-medium transition-colors duration-200
          ${isCompleted ? 'text-green-700' : isCurrent ? 'text-stone-900' : 'text-stone-500'}
        `}>
          {step.label}
        </p>
        <p className="text-xs text-stone-400 mt-1 hidden sm:block">
          {step.description}
        </p>
      </div>

      {/* Indicateur de verrouillage */}
      {step.locked && (
        <span className="mt-2 text-xs text-stone-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Auto
        </span>
      )}
    </div>
  )
}

export default ProductionStepper
