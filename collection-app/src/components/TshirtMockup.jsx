import { useState, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Upload, RotateCcw, ZoomIn, MoveHorizontal, MoveVertical, Trash2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// SVG PATHS — Tracés détaillés du T-shirt (viewBox 400×500)
// ═══════════════════════════════════════════════════════════

const FRONT_BODY = `
  M 55 124
  C 62 98, 95 74, 140 74
  C 158 56, 175 47, 188 50
  Q 200 65, 212 50
  C 225 47, 242 56, 260 74
  C 305 74, 338 98, 345 124
  L 328 174
  C 316 170, 296 158, 284 150
  C 286 172, 284 280, 280 350
  Q 278 405, 275 428
  Q 271 452, 250 452
  L 150 452
  Q 129 452, 125 428
  Q 122 405, 120 350
  C 116 280, 114 172, 116 150
  C 104 158, 84 170, 72 174
  Z
`

const BACK_BODY = `
  M 55 124
  C 62 98, 95 74, 140 74
  C 160 60, 180 52, 200 52
  C 220 52, 240 60, 260 74
  C 305 74, 338 98, 345 124
  L 328 174
  C 316 170, 296 158, 284 150
  C 286 172, 284 280, 280 350
  Q 278 405, 275 428
  Q 271 452, 250 452
  L 150 452
  Q 129 452, 125 428
  Q 122 405, 120 350
  C 116 280, 114 172, 116 150
  C 104 158, 84 170, 72 174
  Z
`

// Clip-path : zone buste uniquement (sans manches) pour masquer le logo
const FRONT_CLIP = `
  M 116 148
  C 114 172, 116 280, 120 350
  Q 122 405, 125 428 Q 129 452, 150 452
  L 250 452
  Q 271 452, 275 428 Q 278 405, 280 350
  C 284 280, 286 172, 284 148
  L 260 74
  C 242 56, 225 47, 212 50
  Q 200 65, 188 50
  C 175 47, 158 56, 140 74
  Z
`

const BACK_CLIP = `
  M 116 148
  C 114 172, 116 280, 120 350
  Q 122 405, 125 428 Q 129 452, 150 452
  L 250 452
  Q 271 452, 275 428 Q 278 405, 280 350
  C 284 280, 286 172, 284 148
  L 260 74
  C 240 60, 220 52, 200 52
  C 180 52, 160 60, 140 74
  Z
`

// Lignes de plis du tissu — avant
const FRONT_FOLDS = [
  'M 190 82 Q 194 220, 191 390',       // pli central poitrine
  'M 152 115 Q 156 260, 153 400',      // pli gauche
  'M 248 115 Q 244 260, 247 400',      // pli droit
  'M 122 168 Q 138 200, 136 250',      // creux sous-bras gauche
  'M 278 168 Q 262 200, 264 250',      // creux sous-bras droit
]

// Lignes de plis du tissu — arrière
const BACK_FOLDS = [
  'M 200 52 L 200 450',                // couture centrale dos
  'M 156 78 Q 159 260, 156 430',       // pli gauche dos
  'M 244 78 Q 241 260, 244 430',       // pli droit dos
]

// Safe zones pour placement logo
const SAFE_ZONES = {
  front: { x: 140, y: 110, w: 120, h: 180 },
  back:  { x: 140, y: 95,  w: 120, h: 200 },
}

const LOGO_BASE_SIZE = 80

const DEFAULT_TRANSFORM = { x: 50, y: 40, scale: 1 }

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Mockup T-shirt SVG haute qualité avec système de logo avancé.
 *
 * @param {object} props
 * @param {string} props.tshirtColor       Couleur du t-shirt (hex)
 * @param {string|null} props.logoFront    Logo avant (data URL ou nom prédéfini)
 * @param {string|null} props.logoBack     Logo arrière (data URL ou nom prédéfini)
 * @param {(src: string|null) => void} props.onLogoFrontChange
 * @param {(src: string|null) => void} props.onLogoBackChange
 */
export default function TshirtMockup({
  tshirtColor = '#FFFFFF',
  logoFront = null,
  logoBack = null,
  onLogoFrontChange,
  onLogoBackChange,
}) {
  const [view, setView] = useState('front')
  const [transforms, setTransforms] = useState({
    front: { ...DEFAULT_TRANSFORM },
    back: { ...DEFAULT_TRANSFORM },
  })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // IDs SVG uniques (évite conflits si plusieurs instances)
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), [])

  const currentLogo = view === 'front' ? logoFront : logoBack
  const currentT = transforms[view]
  const onCurrentLogoChange = view === 'front' ? onLogoFrontChange : onLogoBackChange

  const isLight = isLightColor(tshirtColor)
  const stitchColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.10)'
  const foldColor = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'

  // ── Transform helpers ──
  const updateT = useCallback((key, val) => {
    setTransforms(prev => ({
      ...prev,
      [view]: { ...prev[view], [key]: val },
    }))
  }, [view])

  const resetT = useCallback(() => {
    setTransforms(prev => ({
      ...prev,
      [view]: { ...DEFAULT_TRANSFORM },
    }))
  }, [view])

  // ── Upload handlers ──
  const processFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onCurrentLogoChange?.(e.target.result)
    reader.readAsDataURL(file)
  }, [onCurrentLogoChange])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }, [processFile])

  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true) }, [])
  const onDragLeave = useCallback(() => setIsDragging(false), [])

  const removeLogo = useCallback(() => {
    onCurrentLogoChange?.(null)
    resetT()
  }, [onCurrentLogoChange, resetT])

  // ── Logo position en coordonnées SVG ──
  const zone = SAFE_ZONES[view]
  const logoX = zone.x + (currentT.x / 100) * zone.w
  const logoY = zone.y + (currentT.y / 100) * zone.h
  const logoScale = currentT.scale

  // Perspective subtile (skew selon position)
  const skewY = ((currentT.x - 50) * -0.06).toFixed(2)
  const skewX = ((currentT.y - 50) * 0.03).toFixed(2)

  const isImage = currentLogo?.startsWith?.('data:')
  const half = (LOGO_BASE_SIZE / 2)

  const bodyPath = view === 'front' ? FRONT_BODY : BACK_BODY
  const clipPath = view === 'front' ? FRONT_CLIP : BACK_CLIP
  const folds = view === 'front' ? FRONT_FOLDS : BACK_FOLDS

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── Segmented Control iOS ── */}
      <div className="bg-[#E5E5EA] rounded-[10px] p-[3px] flex w-full max-w-[200px]">
        {['front', 'back'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`
              flex-1 py-2 rounded-[8px] text-[13px] font-semibold transition-all duration-200
              ${view === v ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'}
            `}
          >
            {v === 'front' ? 'Avant' : 'Arrière'}
          </button>
        ))}
      </div>

      {/* ── SVG Mockup ── */}
      <div className="relative w-56 sm:w-64 aspect-[4/5]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full h-full"
          >
            <svg viewBox="0 0 400 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Dégradé lumière haut-gauche */}
                <linearGradient id={`hl-${uid}`} x1="0%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                {/* Dégradé ombre bas-droite */}
                <linearGradient id={`sh-${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="black" stopOpacity="0" />
                  <stop offset="100%" stopColor="black" stopOpacity="0.08" />
                </linearGradient>
                {/* Ombre intérieure manches */}
                <radialGradient id={`arm-sh-l-${uid}`} cx="100%" cy="0%">
                  <stop offset="0%" stopColor="black" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="black" stopOpacity="0" />
                </radialGradient>
                <radialGradient id={`arm-sh-r-${uid}`} cx="0%" cy="0%">
                  <stop offset="0%" stopColor="black" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="black" stopOpacity="0" />
                </radialGradient>
                {/* Drop shadow */}
                <filter id={`ds-${uid}`}>
                  <feDropShadow dx="0" dy="5" stdDeviation="8" floodOpacity="0.10" />
                </filter>
                {/* Clip-path buste pour logo */}
                <clipPath id={`bc-${uid}`}>
                  <path d={clipPath} />
                </clipPath>
              </defs>

              {/* Ombre au sol */}
              <ellipse cx="200" cy="472" rx="105" ry="10" fill="rgba(0,0,0,0.06)" />

              {/* ── T-shirt body ── */}
              <g filter={`url(#ds-${uid})`}>
                <path d={bodyPath} fill={tshirtColor} stroke={stitchColor} strokeWidth="1" />
              </g>

              {/* Highlight overlay */}
              <path d={bodyPath} fill={`url(#hl-${uid})`} />

              {/* Shadow overlay */}
              <path d={bodyPath} fill={`url(#sh-${uid})`} />

              {/* Ombres sous-bras */}
              <ellipse cx="120" cy="168" rx="18" ry="35" fill={`url(#arm-sh-l-${uid})`} opacity="0.5" />
              <ellipse cx="280" cy="168" rx="18" ry="35" fill={`url(#arm-sh-r-${uid})`} opacity="0.5" />

              {/* Plis du tissu */}
              {folds.map((d, i) => (
                <path key={i} d={d} fill="none" stroke={foldColor} strokeWidth="1.2" strokeLinecap="round" />
              ))}

              {/* ── Col ── */}
              {view === 'front' ? (
                <g>
                  {/* Col crew neck — 3 lignes de côte */}
                  <path d="M 188 50 Q 200 65, 212 50" fill="none" stroke={stitchColor} strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 190 51 Q 200 62, 210 51" fill="none" stroke={stitchColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                  <path d="M 192 53 Q 200 59, 208 53" fill="none" stroke={stitchColor} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
                </g>
              ) : (
                <g>
                  {/* Col dos + couture tag */}
                  <path d="M 160 60 C 175 66, 225 66, 240 60" fill="none" stroke={stitchColor} strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 162 61 C 175 65, 225 65, 238 61" fill="none" stroke={stitchColor} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                  {/* Étiquette col (petit rectangle) */}
                  <rect x="194" y="56" width="12" height="8" rx="1.5" fill="none" stroke={stitchColor} strokeWidth="0.8" opacity="0.4" />
                </g>
              )}

              {/* Coutures épaules */}
              <line x1="140" y1="74" x2="116" y2="150" stroke={stitchColor} strokeWidth="0.6" opacity="0.3" strokeDasharray="4 3" />
              <line x1="260" y1="74" x2="284" y2="150" stroke={stitchColor} strokeWidth="0.6" opacity="0.3" strokeDasharray="4 3" />

              {/* Couture ourlet bas */}
              <path d="M 150 448 Q 200 454, 250 448" fill="none" stroke={stitchColor} strokeWidth="0.8" opacity="0.4" strokeDasharray="3 2" />

              {/* ══════════════════════════════════════ */}
              {/* LOGO — clippé au buste, avec perspective */}
              {/* ══════════════════════════════════════ */}
              {currentLogo ? (
                <g clipPath={`url(#bc-${uid})`}>
                  {/* Ombre portée du logo */}
                  <g transform={`translate(${logoX + 2}, ${logoY + 3})`} opacity="0.08">
                    <g transform={`scale(${logoScale}) skewX(${skewX}) skewY(${skewY})`}>
                      {isImage ? (
                        <rect x={-half} y={-half} width={LOGO_BASE_SIZE} height={LOGO_BASE_SIZE} rx="4" fill="black" />
                      ) : (
                        <text x="0" y="6" textAnchor="middle" fontSize="22" fontWeight="900" fill="black">
                          {currentLogo}
                        </text>
                      )}
                    </g>
                  </g>
                  {/* Logo principal */}
                  <g transform={`translate(${logoX}, ${logoY})`}>
                    <g transform={`scale(${logoScale}) skewX(${skewX}) skewY(${skewY})`}>
                      {isImage ? (
                        <image
                          href={currentLogo}
                          x={-half}
                          y={-half}
                          width={LOGO_BASE_SIZE}
                          height={LOGO_BASE_SIZE}
                          preserveAspectRatio="xMidYMid meet"
                        />
                      ) : (
                        <text
                          x="0"
                          y="6"
                          textAnchor="middle"
                          fontSize="22"
                          fontWeight="900"
                          letterSpacing="1.5"
                          fill={isLight ? '#1D1D1F' : '#FFFFFF'}
                          fontFamily="-apple-system, system-ui, sans-serif"
                        >
                          {currentLogo}
                        </text>
                      )}
                    </g>
                  </g>
                </g>
              ) : (
                /* Placeholder zone logo */
                <g clipPath={`url(#bc-${uid})`}>
                  <rect
                    x={zone.x + zone.w * 0.15} y={zone.y + zone.h * 0.2}
                    width={zone.w * 0.7} height={zone.h * 0.35}
                    rx="14"
                    fill={isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.04)'}
                    stroke={isLight ? '#D1D5DB' : 'rgba(255,255,255,0.15)'}
                    strokeWidth="1" strokeDasharray="6 4"
                  />
                  <text
                    x="200" y={zone.y + zone.h * 0.4}
                    textAnchor="middle" fontSize="10" fontWeight="500"
                    fill={isLight ? '#C7C7CC' : 'rgba(255,255,255,0.25)'}
                    fontFamily="-apple-system, system-ui, sans-serif"
                  >
                    {view === 'front' ? 'LOGO AVANT' : 'LOGO ARRIÈRE'}
                  </text>
                </g>
              )}
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Zone Upload / Drag-and-Drop ── */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          w-full max-w-[280px] border-2 border-dashed rounded-2xl py-4 px-5
          flex items-center justify-center gap-2.5 cursor-pointer
          transition-all duration-200 select-none
          ${isDragging
            ? 'border-[#007AFF] bg-[#007AFF]/5 scale-[1.02]'
            : 'border-[#D1D5DB] hover:border-[#007AFF]/40 hover:bg-[#FAFAFA]'
          }
        `}
      >
        <Upload size={16} className="text-[#86868B] shrink-0" />
        <span className="text-[13px] text-[#86868B]">
          {isDragging ? 'Déposez ici' : 'Glissez ou cliquez pour uploader'}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { processFile(e.target.files?.[0]); e.target.value = '' }}
        />
      </div>

      {/* ── Contrôles de transformation ── */}
      {currentLogo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full max-w-[280px] space-y-2.5"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">
              Ajustements
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetT}
                className="flex items-center gap-1 text-[11px] text-[#007AFF] font-medium active:opacity-60"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <button
                type="button"
                onClick={removeLogo}
                className="flex items-center gap-1 text-[11px] text-[#FF3B30] font-medium active:opacity-60"
              >
                <Trash2 size={12} /> Retirer
              </button>
            </div>
          </div>

          <Slider icon={<ZoomIn size={13} />} label="Taille" min={30} max={250} value={Math.round(currentT.scale * 100)} onChange={(v) => updateT('scale', v / 100)} />
          <Slider icon={<MoveHorizontal size={13} />} label="Horizontal" min={0} max={100} value={currentT.x} onChange={(v) => updateT('x', v)} />
          <Slider icon={<MoveVertical size={13} />} label="Vertical" min={0} max={100} value={currentT.y} onChange={(v) => updateT('y', v)} />
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════

/** Slider iOS-style avec label et icône */
function Slider({ icon, label, min, max, value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-[#86868B] w-4 shrink-0 flex justify-center">{icon}</div>
      <span className="text-[11px] text-[#86868B] w-[60px] shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          flex-1 h-[3px] rounded-full appearance-none cursor-pointer bg-[#E5E5EA]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px]
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.22)]
          [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#E5E5EA]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px]
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.22)]
          [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#E5E5EA]
          [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none
        "
      />
      <span className="text-[10px] text-[#C7C7CC] w-8 text-right tabular-nums">{value}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function isLightColor(hex) {
  if (!hex || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}
