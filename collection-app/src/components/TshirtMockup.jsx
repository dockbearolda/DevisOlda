import { useState } from 'react'

/**
 * Mockup T-shirt SVG interactif — style Apple, clean
 */
export default function TshirtMockup({
  tshirtColor = '#FFFFFF',
  frontLogo = null,
  backLogo = null,
}) {
  const [view, setView] = useState('front')

  const currentLogo = view === 'front' ? frontLogo : backLogo
  const isLight = isLightColor(tshirtColor)
  const stitchColor = isLight ? '#D1D5DB' : 'rgba(255,255,255,0.12)'
  const placeholderFill = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)'
  const placeholderStroke = isLight ? '#C7C7CC' : 'rgba(255,255,255,0.2)'
  const placeholderText = isLight ? '#C7C7CC' : 'rgba(255,255,255,0.3)'

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Toggle Avant / Arrière — style segmented control iOS */}
      <div className="bg-[#E5E5EA] rounded-[9px] p-[2px] flex">
        <button
          type="button"
          onClick={() => setView('front')}
          className={`
            px-6 py-1.5 rounded-[7px] text-[13px] font-semibold transition-all duration-200
            ${view === 'front'
              ? 'bg-white text-[#1D1D1F] shadow-sm'
              : 'text-[#86868B]'
            }
          `}
        >
          Avant
        </button>
        <button
          type="button"
          onClick={() => setView('back')}
          className={`
            px-6 py-1.5 rounded-[7px] text-[13px] font-semibold transition-all duration-200
            ${view === 'back'
              ? 'bg-white text-[#1D1D1F] shadow-sm'
              : 'text-[#86868B]'
            }
          `}
        >
          Arrière
        </button>
      </div>

      {/* SVG Mockup */}
      <div className="relative w-48 sm:w-64 aspect-[3/4]">
        <svg viewBox="0 0 300 380" className="w-full h-full">
          {/* Ombre douce */}
          <ellipse cx="150" cy="355" rx="90" ry="8" fill="rgba(0,0,0,0.06)" />

          {/* T-shirt */}
          <path
            d={TSHIRT_PATH}
            fill={tshirtColor}
            stroke={stitchColor}
            strokeWidth="1"
          />

          {/* Col */}
          {view === 'front' ? (
            <path d="M 120 46 C 130 56, 170 56, 180 46" fill="none" stroke={stitchColor} strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M 125 40 C 135 44, 165 44, 175 40" fill="none" stroke={stitchColor} strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Couture dos */}
          {view === 'back' && (
            <line x1="150" y1="44" x2="150" y2="330" stroke={stitchColor} strokeWidth="0.4" opacity="0.4" />
          )}

          {/* Zone logo */}
          {currentLogo ? (
            <foreignObject x="100" y={view === 'front' ? '120' : '100'} width="100" height="100">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={currentLogo}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </foreignObject>
          ) : (
            <g>
              <rect
                x="115" y={view === 'front' ? '130' : '110'}
                width="70" height="70" rx="10"
                fill={placeholderFill}
                stroke={placeholderStroke}
                strokeWidth="1"
                strokeDasharray="5 4"
              />
              <text
                x="150" y={view === 'front' ? '170' : '150'}
                textAnchor="middle"
                fontSize="9"
                fill={placeholderText}
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="500"
              >
                {view === 'front' ? 'LOGO AVANT' : 'LOGO ARRIÈRE'}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

const TSHIRT_PATH = `
  M 68 72 C 68 50, 100 32, 150 32 C 200 32, 232 50, 232 72
  L 272 96 L 252 140 L 220 118
  L 220 320 Q 220 332, 208 332
  L 92 332 Q 80 332, 80 320
  L 80 118 L 48 140 L 28 96 Z
`

function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}
