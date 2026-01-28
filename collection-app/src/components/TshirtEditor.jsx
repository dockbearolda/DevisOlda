import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'

// Couleurs de t-shirt disponibles
const TSHIRT_COLORS = [
  { value: '#FFFFFF', label: 'Blanc Pure' },
  { value: '#1A1A1A', label: 'Noir Deep' },
  { value: '#FDFD96', label: 'Jaune Pastel' },
  { value: '#FFD1DC', label: 'Rose Pastel' },
  { value: '#B3E5FC', label: 'Bleu Ciel' },
  { value: '#C1E1C1', label: 'Vert Menthe' },
  { value: '#E6E6FA', label: 'Lavande' },
  { value: '#FFDAB9', label: 'Peche' },
  { value: '#F5F5DC', label: 'Beige' },
  { value: '#B0E0E6', label: 'Bleu Poudre' },
  { value: '#F08080', label: 'Corail Douce' },
  { value: '#D3D3D3', label: 'Gris Clair' },
  { value: '#FAF0E6', label: 'Lin' },
  { value: '#FFF5EE', label: 'Coquillage' },
  { value: '#F0FFFF', label: 'Azure' }
]

// Couleurs de logo disponibles
const LOGO_COLORS = [
  { value: '#000000', label: 'Noir' },
  { value: '#FFFFFF', label: 'Blanc' },
  { value: '#FF3B30', label: 'Rouge Apple' },
  { value: '#007AFF', label: 'Bleu Apple' },
  { value: '#34C759', label: 'Vert Apple' },
  { value: '#FFCC00', label: 'Or / Jaune' },
  { value: '#AF52DE', label: 'Violet' },
  { value: '#5856D6', label: 'Indigo' },
  { value: '#FF9500', label: 'Orange' },
  { value: '#A2845E', label: 'Bronze' },
  { value: '#8E8E93', label: 'Gris' },
  { value: '#C0C0C0', label: 'Argent' },
  { value: '#FF2D55', label: 'Rose Flash' },
  { value: '#5AC8FA', label: 'Bleu Cyan' },
  { value: '#000080', label: 'Marine' },
  { value: '#556B2F', label: 'Olive' }
]

// Logos predefinies (references officielles)
const PRESET_LOGOS = ['BEA-16', 'SXM-12', 'VIN-01', 'SUR-07']

// Composant SVG du T-shirt AVANT
function TshirtSvgFront({ color }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 300 350">
      <defs>
        <linearGradient id="shadeFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.05)' }} />
        </linearGradient>
      </defs>
      <path
        d="M 100,25 L 70,35 L 15,70 L 35,115 L 55,100 L 55,320 L 245,320 L 245,100 L 265,115 L 285,70 L 230,35 L 200,25 C 190,45 160,55 150,55 C 140,55 110,45 100,25 Z"
        fill={color}
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 100,25 L 70,35 L 15,70 L 35,115 L 55,100 L 55,320 L 245,320 L 245,100 L 265,115 L 285,70 L 230,35 L 200,25 C 190,45 160,55 150,55 C 140,55 110,45 100,25 Z"
        fill="url(#shadeFront)"
        opacity="0.4"
      />
      <path
        d="M 100,25 C 110,45 140,55 150,55 C 160,55 190,45 200,25"
        fill="none"
        stroke="#BBBBBB"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line x1="55" y1="100" x2="70" y2="35" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="4,2" />
      <line x1="245" y1="100" x2="230" y2="35" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="4,2" />
      <line x1="58" y1="316" x2="242" y2="316" stroke="#E0E0E0" strokeWidth="1.5" />
    </svg>
  )
}

// Composant SVG du T-shirt ARRIERE
function TshirtSvgBack({ color }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 300 350">
      <defs>
        <linearGradient id="shadeBack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.05)' }} />
        </linearGradient>
      </defs>
      <path
        d="M 100,25 L 70,35 L 15,70 L 35,115 L 55,100 L 55,320 L 245,320 L 245,100 L 265,115 L 285,70 L 230,35 L 200,25 C 195,30 175,35 150,35 C 125,35 105,30 100,25 Z"
        fill={color}
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 100,25 L 70,35 L 15,70 L 35,115 L 55,100 L 55,320 L 245,320 L 245,100 L 265,115 L 285,70 L 230,35 L 200,25 C 195,30 175,35 150,35 C 125,35 105,30 100,25 Z"
        fill="url(#shadeBack)"
        opacity="0.4"
      />
      <path
        d="M 100,25 C 105,30 125,35 150,35 C 175,35 195,30 200,25"
        fill="none"
        stroke="#BBBBBB"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="140" y="38" width="20" height="10" rx="1" fill="#F8F8F8" stroke="#DDDDDD" strokeWidth="1" />
      <line x1="55" y1="100" x2="70" y2="35" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="4,2" />
      <line x1="245" y1="100" x2="230" y2="35" stroke="#E5E5E5" strokeWidth="1" strokeDasharray="4,2" />
      <line x1="58" y1="316" x2="242" y2="316" stroke="#E0E0E0" strokeWidth="1.5" />
    </svg>
  )
}

// Composant principal TshirtEditor - Version simplifiee sans Fabric.js
const TshirtEditor = forwardRef(function TshirtEditor({
  disabled = false,
  tshirtColor = '#FFFFFF',
  logoColor = '#000000',
  size = 'M',
  onTshirtColorChange,
  onLogoColorChange,
  onSizeChange,
  onLogoFrontChange,
  onLogoBackChange,
  logoFront,
  logoBack
}, ref) {
  const [activeView, setActiveView] = useState({ front: true, back: false })
  const [selectedLogoFront, setSelectedLogoFront] = useState(logoFront || '')
  const [selectedLogoBack, setSelectedLogoBack] = useState(logoBack || '')
  const [uploadedImageFront, setUploadedImageFront] = useState(null)
  const [uploadedImageBack, setUploadedImageBack] = useState(null)
  const fileInputFrontRef = useRef(null)
  const fileInputBackRef = useRef(null)

  // Gerer l'upload d'image
  const handleFileUpload = useCallback((side, event) => {
    const file = event.target.files?.[0]
    if (!file || disabled) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      if (side === 'front') {
        setUploadedImageFront(evt.target.result)
        setSelectedLogoFront('')
      } else {
        setUploadedImageBack(evt.target.result)
        setSelectedLogoBack('')
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }, [disabled])

  // Supprimer une image
  const handleRemoveImage = (side) => {
    if (side === 'front') {
      setUploadedImageFront(null)
    } else {
      setUploadedImageBack(null)
    }
  }

  // Exposer methodes via ref
  useImperativeHandle(ref, () => ({
    clearSelection: () => {},
    getCanvasData: () => ({
      front: null,
      back: null
    })
  }))

  return (
    <div className="space-y-6">
      {/* Selecteurs en ligne */}
      <div className="space-y-4">
        {/* Couleur T-shirt */}
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Couleur T-Shirt</label>
          <select
            value={tshirtColor}
            onChange={(e) => onTshirtColorChange?.(e.target.value)}
            disabled={disabled}
            className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                       disabled:bg-stone-100 disabled:cursor-not-allowed"
          >
            {TSHIRT_COLORS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Couleur Logo */}
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Couleur Logo</label>
          <select
            value={logoColor}
            onChange={(e) => onLogoColorChange?.(e.target.value)}
            disabled={disabled}
            className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                       disabled:bg-stone-100 disabled:cursor-not-allowed"
          >
            {LOGO_COLORS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Boutons de vue AVANT / ARRIERE */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveView(prev => ({ ...prev, front: !prev.front }))}
          className={`
            py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200
            ${activeView.front
              ? 'bg-stone-900 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }
          `}
        >
          AVANT
        </button>
        <button
          onClick={() => setActiveView(prev => ({ ...prev, back: !prev.back }))}
          className={`
            py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200
            ${activeView.back
              ? 'bg-stone-900 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }
          `}
        >
          ARRIERE
        </button>
      </div>

      {/* Inputs fichiers caches */}
      <input
        ref={fileInputFrontRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileUpload('front', e)}
      />
      <input
        ref={fileInputBackRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileUpload('back', e)}
      />

      {/* Zone AVANT */}
      {activeView.front && (
        <div className="animate-fade-in">
          {/* Selection logo AVANT */}
          <div className="mb-3">
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Logo AVANT</label>
            <div className="flex gap-2">
              <select
                value={selectedLogoFront}
                onChange={(e) => {
                  setSelectedLogoFront(e.target.value)
                  setUploadedImageFront(null)
                }}
                disabled={disabled}
                className="flex-1 h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Choisir logo --</option>
                {PRESET_LOGOS.map(logo => (
                  <option key={logo} value={logo}>{logo}</option>
                ))}
              </select>
              {!disabled && (
                <button
                  onClick={() => fileInputFrontRef.current?.click()}
                  className="px-4 h-11 bg-stone-900 text-white rounded-xl font-bold text-xs
                             hover:bg-stone-800 transition-all duration-200"
                >
                  IMPORTER
                </button>
              )}
            </div>
          </div>

          {/* Preview T-shirt AVANT */}
          <div className="relative w-[300px] h-[350px] mx-auto bg-gradient-to-br from-stone-50 to-stone-100
                          rounded-2xl border border-stone-200 overflow-hidden shadow-inner">
            <TshirtSvgFront color={tshirtColor} />

            {/* Zone logo */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pt-8">
              {uploadedImageFront ? (
                <div className="relative">
                  <img
                    src={uploadedImageFront}
                    alt="Logo"
                    className="max-w-[100px] max-h-[100px] object-contain"
                  />
                  {!disabled && (
                    <button
                      onClick={() => handleRemoveImage('front')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                                 flex items-center justify-center text-xs font-bold"
                    >
                      X
                    </button>
                  )}
                </div>
              ) : selectedLogoFront ? (
                <span
                  className="text-3xl font-black"
                  style={{ color: logoColor }}
                >
                  {selectedLogoFront}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Zone ARRIERE */}
      {activeView.back && (
        <div className="animate-fade-in">
          {/* Selection logo ARRIERE */}
          <div className="mb-3">
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Logo ARRIERE</label>
            <div className="flex gap-2">
              <select
                value={selectedLogoBack}
                onChange={(e) => {
                  setSelectedLogoBack(e.target.value)
                  setUploadedImageBack(null)
                }}
                disabled={disabled}
                className="flex-1 h-11 px-4 rounded-xl border border-stone-200 bg-white text-sm font-semibold
                           disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Choisir logo --</option>
                {PRESET_LOGOS.map(logo => (
                  <option key={logo} value={logo}>{logo}</option>
                ))}
              </select>
              {!disabled && (
                <button
                  onClick={() => fileInputBackRef.current?.click()}
                  className="px-4 h-11 bg-stone-900 text-white rounded-xl font-bold text-xs
                             hover:bg-stone-800 transition-all duration-200"
                >
                  IMPORTER
                </button>
              )}
            </div>
          </div>

          {/* Preview T-shirt ARRIERE */}
          <div className="relative w-[300px] h-[350px] mx-auto bg-gradient-to-br from-stone-50 to-stone-100
                          rounded-2xl border border-stone-200 overflow-hidden shadow-inner">
            <TshirtSvgBack color={tshirtColor} />

            {/* Zone logo */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pt-8">
              {uploadedImageBack ? (
                <div className="relative">
                  <img
                    src={uploadedImageBack}
                    alt="Logo"
                    className="max-w-[150px] max-h-[150px] object-contain"
                  />
                  {!disabled && (
                    <button
                      onClick={() => handleRemoveImage('back')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                                 flex items-center justify-center text-xs font-bold"
                    >
                      X
                    </button>
                  )}
                </div>
              ) : selectedLogoBack ? (
                <span
                  className="text-4xl font-black"
                  style={{ color: logoColor }}
                >
                  {selectedLogoBack}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default TshirtEditor
