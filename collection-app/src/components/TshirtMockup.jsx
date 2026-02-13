import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

/**
 * Mockup interactif T-shirt avec vues Avant/Arrière
 * Change de couleur en temps réel selon la sélection
 */
export default function TshirtMockup({
  tshirtColor = '#FFFFFF',
  logoColor = '#111827',
  frontLogo = null,
  backLogo = null,
}) {
  const [view, setView] = useState('front')

  const currentLogo = view === 'front' ? frontLogo : backLogo
  const isLight = isLightColor(tshirtColor)
  const strokeColor = isLight ? '#D1D5DB' : 'rgba(255,255,255,0.15)'
  const placeholderColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'
  const placeholderTextColor = isLight ? '#9CA3AF' : 'rgba(255,255,255,0.35)'

  return (
    <div className="flex flex-col items-center gap-4 h-full justify-center">
      {/* Toggle Avant / Arrière */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setView('front')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'front'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Avant
        </button>
        <button
          type="button"
          onClick={() => setView('back')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'back'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Arrière
        </button>
        <button
          type="button"
          onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-all"
          title="Retourner"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* SVG Mockup */}
      <div className="relative w-full max-w-[320px] aspect-[3/4]">
        <svg viewBox="0 0 300 380" className="w-full h-full drop-shadow-lg">
          {/* T-shirt shape */}
          {view === 'front' ? (
            <FrontView color={tshirtColor} strokeColor={strokeColor} />
          ) : (
            <BackView color={tshirtColor} strokeColor={strokeColor} />
          )}

          {/* Logo zone placeholder ou image */}
          {currentLogo ? (
            <foreignObject x="100" y={view === 'front' ? '120' : '100'} width="100" height="100">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={currentLogo}
                  alt={`Logo ${view === 'front' ? 'avant' : 'arrière'}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.15))` }}
                />
              </div>
            </foreignObject>
          ) : (
            <>
              <rect
                x="112" y={view === 'front' ? '130' : '110'}
                width="76" height="76" rx="8"
                fill={placeholderColor}
                stroke={placeholderTextColor}
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x="150" y={view === 'front' ? '173' : '153'}
                textAnchor="middle"
                fontSize="10"
                fill={placeholderTextColor}
                fontFamily="Inter, sans-serif"
              >
                {view === 'front' ? 'LOGO AVANT' : 'LOGO ARRIÈRE'}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Couleur info */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: tshirtColor }}
        />
        <span className="text-xs text-gray-400">
          T-shirt {tshirtColor}
        </span>
        <div
          className="w-4 h-4 rounded-full border border-gray-300 ml-2"
          style={{ backgroundColor: logoColor }}
        />
        <span className="text-xs text-gray-400">
          Logo {logoColor}
        </span>
      </div>
    </div>
  )
}

/* SVG T-shirt Avant */
function FrontView({ color, strokeColor }) {
  return (
    <g>
      {/* Ombre */}
      <path
        d="M 68 72 C 68 50, 100 32, 150 32 C 200 32, 232 50, 232 72
           L 272 96 L 252 140 L 220 118
           L 220 320 Q 220 332, 208 332
           L 92 332 Q 80 332, 80 320
           L 80 118 L 48 140 L 28 96 Z"
        fill="rgba(0,0,0,0.06)"
        transform="translate(2, 3)"
      />
      {/* Corps */}
      <path
        d="M 68 72 C 68 50, 100 32, 150 32 C 200 32, 232 50, 232 72
           L 272 96 L 252 140 L 220 118
           L 220 320 Q 220 332, 208 332
           L 92 332 Q 80 332, 80 320
           L 80 118 L 48 140 L 28 96 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1"
      />
      {/* Col rond */}
      <path
        d="M 120 46 C 130 56, 170 56, 180 46"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Coutures manches */}
      <line x1="80" y1="118" x2="80" y2="80" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
      <line x1="220" y1="118" x2="220" y2="80" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
    </g>
  )
}

/* SVG T-shirt Arrière */
function BackView({ color, strokeColor }) {
  return (
    <g>
      {/* Ombre */}
      <path
        d="M 68 72 C 68 50, 100 32, 150 32 C 200 32, 232 50, 232 72
           L 272 96 L 252 140 L 220 118
           L 220 320 Q 220 332, 208 332
           L 92 332 Q 80 332, 80 320
           L 80 118 L 48 140 L 28 96 Z"
        fill="rgba(0,0,0,0.06)"
        transform="translate(2, 3)"
      />
      {/* Corps */}
      <path
        d="M 68 72 C 68 50, 100 32, 150 32 C 200 32, 232 50, 232 72
           L 272 96 L 252 140 L 220 118
           L 220 320 Q 220 332, 208 332
           L 92 332 Q 80 332, 80 320
           L 80 118 L 48 140 L 28 96 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1"
      />
      {/* Col arrière (plus haut, pas d'échancrure) */}
      <path
        d="M 125 40 C 135 44, 165 44, 175 40"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Ligne couture centrale dos */}
      <line x1="150" y1="44" x2="150" y2="332" stroke={strokeColor} strokeWidth="0.3" opacity="0.3" />
      {/* Coutures manches */}
      <line x1="80" y1="118" x2="80" y2="80" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
      <line x1="220" y1="118" x2="220" y2="80" stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
    </g>
  )
}

function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}
