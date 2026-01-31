import { useRef, useEffect } from 'react'

function TabBar({ fiches, activeTabId, onSelectTab, onCloseTab, onAddTab, viewLabel }) {
  const tabsContainerRef = useRef(null)
  const activeTabRef = useRef(null)

  // Scroll vers l'onglet actif quand il change
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [activeTabId])

  return (
    <div className="bg-stone-100 border-b border-stone-200 sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">
          {/* Label de la vue */}
          {viewLabel && (
            <div className="flex-shrink-0 hidden sm:block">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                {viewLabel}
              </span>
            </div>
          )}

          {/* Tabs Container */}
          <div
            ref={tabsContainerRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1"
          >
            {fiches.map((fiche) => (
              <Tab
                key={fiche.id}
                fiche={fiche}
                isActive={fiche.id === activeTabId}
                onSelect={() => onSelectTab(fiche.id)}
                onClose={() => onCloseTab(fiche.id)}
                ref={fiche.id === activeTabId ? activeTabRef : null}
              />
            ))}
          </div>

          {/* Add Tab Button - Seulement si onAddTab est defini */}
          {onAddTab && (
            <button
              onClick={onAddTab}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white
                         rounded-xl hover:bg-stone-800 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2
                         text-sm font-semibold shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nouvelle commande</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Composant Tab individuel
import { forwardRef } from 'react'

const Tab = forwardRef(function Tab({ fiche, isActive, onSelect, onClose }, ref) {
  const displayName = fiche.clientName || 'Sans nom'
  const truncatedName = displayName.length > 15 ? displayName.substring(0, 15) + '...' : displayName

  return (
    <div
      ref={ref}
      className={`
        group relative flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer
        transition-all duration-200 min-w-[140px] max-w-[200px]
        ${isActive
          ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
          : 'bg-stone-200/50 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
        }
        ${fiche.isUrgent && !fiche.productionSteps?.completed ? 'animate-pulse-urgent' : ''}
      `}
      onClick={onSelect}
    >
      {/* Status Indicator */}
      <div className={`
        w-2 h-2 rounded-full flex-shrink-0
        ${fiche.isValidated
          ? 'bg-green-500'
          : fiche.isUrgent
            ? 'bg-red-500'
            : 'bg-stone-400'
        }
      `} />

      {/* Tab Name */}
      <span className="flex-1 text-sm font-medium truncate">
        {truncatedName}
      </span>

      {/* Urgent Badge */}
      {fiche.isUrgent && !fiche.productionSteps?.completed && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className={`
          flex-shrink-0 p-0.5 rounded-full
          transition-all duration-200
          ${isActive
            ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            : 'text-stone-400 hover:text-stone-600 hover:bg-stone-300'
          }
          opacity-0 group-hover:opacity-100
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Validated Badge */}
      {fiche.isValidated && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  )
})

export default TabBar
