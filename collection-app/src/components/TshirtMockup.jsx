import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Mockup T-shirt avec Segmented Control iOS et animations Framer Motion
 */
export default function TshirtMockup({
  tshirtColor = '#FFFFFF',
  logoFront = null,
  logoBack = null,
}) {
  const [view, setView] = useState('front')

  const currentLogo = view === 'front' ? logoFront : logoBack
  const isLight = isLightColor(tshirtColor)
  const stitchColor = isLight ? '#D1D5DB' : 'rgba(255,255,255,0.15)'
  const placeholderFill = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)'
  const placeholderStroke = isLight ? '#C7C7CC' : 'rgba(255,255,255,0.2)'
  const placeholderText = isLight ? '#C7C7CC' : 'rgba(255,255,255,0.3)'

  return (
    <div className="flex flex-col items-center gap-5">
      {/* ── Segmented Control iOS ── */}
      <div className="bg-[#E5E5EA] rounded-[10px] p-[3px] flex w-full max-w-[200px]">
        {[
          { value: 'front', label: 'Avant' },
          { value: 'back', label: 'Arrière' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setView(opt.value)}
            className={`
              flex-1 py-2 rounded-[8px] text-[13px] font-semibold transition-all duration-200
              ${view === opt.value
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B]'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── SVG Mockup avec animation fondu ── */}
      <div className="relative w-48 sm:w-56 aspect-[3/4]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full h-full"
          >
            <svg viewBox="0 0 300 380" className="w-full h-full">
              {/* Ombre douce */}
              <ellipse cx="150" cy="358" rx="85" ry="7" fill="rgba(0,0,0,0.05)" />

              {/* T-shirt */}
              <path
                d={view === 'front' ? TSHIRT_FRONT : TSHIRT_BACK}
                fill={tshirtColor}
                stroke={stitchColor}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Dégradé subtil */}
              <defs>
                <linearGradient id={`shade-${view}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.25)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.04)' }} />
                </linearGradient>
              </defs>
              <path
                d={view === 'front' ? TSHIRT_FRONT : TSHIRT_BACK}
                fill={`url(#shade-${view})`}
                opacity="0.5"
              />

              {/* Col */}
              {view === 'front' ? (
                <path
                  d="M 120 46 C 130 56, 170 56, 180 46"
                  fill="none"
                  stroke={stitchColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <path
                    d="M 125 40 C 135 44, 165 44, 175 40"
                    fill="none"
                    stroke={stitchColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Couture dos */}
                  <line
                    x1="150" y1="44" x2="150" y2="330"
                    stroke={stitchColor}
                    strokeWidth="0.4"
                    opacity="0.3"
                  />
                </>
              )}

              {/* Zone logo / placeholder */}
              {currentLogo ? (
                <text
                  x="150"
                  y={view === 'front' ? '175' : '165'}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="900"
                  fill={isLight ? '#1D1D1F' : '#FFFFFF'}
                  fontFamily="-apple-system, system-ui, sans-serif"
                  letterSpacing="1"
                >
                  {currentLogo}
                </text>
              ) : (
                <g>
                  <rect
                    x="115"
                    y={view === 'front' ? '130' : '115'}
                    width="70"
                    height="70"
                    rx="12"
                    fill={placeholderFill}
                    stroke={placeholderStroke}
                    strokeWidth="1"
                    strokeDasharray="5 4"
                  />
                  <text
                    x="150"
                    y={view === 'front' ? '170' : '155'}
                    textAnchor="middle"
                    fontSize="9"
                    fill={placeholderText}
                    fontFamily="-apple-system, system-ui, sans-serif"
                    fontWeight="500"
                  >
                    {view === 'front' ? 'LOGO AVANT' : 'LOGO ARRIÈRE'}
                  </text>
                </g>
              )}
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

const TSHIRT_FRONT = `
  M 68 72 C 68 50, 100 32, 150 32 C 200 32, 232 50, 232 72
  L 272 96 L 252 140 L 220 118
  L 220 320 Q 220 332, 208 332
  L 92 332 Q 80 332, 80 320
  L 80 118 L 48 140 L 28 96 Z
`

const TSHIRT_BACK = `
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
