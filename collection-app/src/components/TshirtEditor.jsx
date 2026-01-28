import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import * as fabric from 'fabric'

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

// Tailles disponibles
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Logos predefinies
const PRESET_LOGOS = ['BEA-16', 'SXM-12', 'WRA-01', 'VIN-01']

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
      <path
        d="M 102,28 C 112,46 141,54 150,54 C 159,54 188,46 198,28"
        fill="none"
        stroke="#DDDDDD"
        strokeWidth="1.5"
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

// Composant principal TshirtEditor
const TshirtEditor = forwardRef(function TshirtEditor({
  disabled = false,
  tshirtColor = '#FFFFFF',
  logoColor = '#000000',
  size = 'M',
  onTshirtColorChange,
  onLogoColorChange,
  onSizeChange
}, ref) {
  const canvasFrontRef = useRef(null)
  const canvasBackRef = useRef(null)
  const fabricFrontRef = useRef(null)
  const fabricBackRef = useRef(null)
  const fileInputFrontRef = useRef(null)
  const fileInputBackRef = useRef(null)

  const [activeView, setActiveView] = useState({ front: true, back: false })

  // Initialiser les canvas Fabric.js
  useEffect(() => {
    if (canvasFrontRef.current && !fabricFrontRef.current) {
      fabricFrontRef.current = new fabric.Canvas(canvasFrontRef.current, {
        width: 300,
        height: 350,
        selection: !disabled
      })
      setupCanvas(fabricFrontRef.current)
    }

    if (canvasBackRef.current && !fabricBackRef.current) {
      fabricBackRef.current = new fabric.Canvas(canvasBackRef.current, {
        width: 300,
        height: 350,
        selection: !disabled
      })
      setupCanvas(fabricBackRef.current)
    }

    return () => {
      if (fabricFrontRef.current) {
        fabricFrontRef.current.dispose()
        fabricFrontRef.current = null
      }
      if (fabricBackRef.current) {
        fabricBackRef.current.dispose()
        fabricBackRef.current = null
      }
    }
  }, [])

  // Mettre a jour l'interactivite quand disabled change
  useEffect(() => {
    if (fabricFrontRef.current) {
      fabricFrontRef.current.selection = !disabled
      fabricFrontRef.current.forEachObject(obj => {
        obj.selectable = !disabled
        obj.evented = !disabled
      })
      fabricFrontRef.current.renderAll()
    }
    if (fabricBackRef.current) {
      fabricBackRef.current.selection = !disabled
      fabricBackRef.current.forEachObject(obj => {
        obj.selectable = !disabled
        obj.evented = !disabled
      })
      fabricBackRef.current.renderAll()
    }
  }, [disabled])

  // Configurer le canvas avec le bouton de suppression
  const setupCanvas = (canvas) => {
    canvas.on('object:scaling', (e) => {
      if (e.target) {
        e.target.set({ scaleY: e.target.scaleX })
      }
    })

    // Ajouter controle de suppression personnalise
    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: (eventData, transform) => {
        const target = transform.target
        const canvas = target.canvas
        canvas.remove(target)
        canvas.requestRenderAll()
        return true
      },
      render: (ctx, left, top) => {
        ctx.save()
        ctx.translate(left, top)
        ctx.beginPath()
        ctx.arc(0, 0, 12, 0, 2 * Math.PI)
        ctx.fillStyle = '#FF3B30'
        ctx.fill()
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.moveTo(-5, -5)
        ctx.lineTo(5, 5)
        ctx.moveTo(5, -5)
        ctx.lineTo(-5, 5)
        ctx.stroke()
        ctx.restore()
      }
    })
  }

  // Ajouter du texte predefinies au canvas
  const addPresetText = useCallback((side, text) => {
    const canvas = side === 'front' ? fabricFrontRef.current : fabricBackRef.current
    if (!canvas || disabled) return

    const textObj = new fabric.FabricText(text, {
      fontSize: 35,
      fontWeight: '900',
      fill: logoColor,
      left: 150,
      top: 130,
      originX: 'center',
      originY: 'center',
      padding: 25
    })

    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.renderAll()
  }, [logoColor, disabled])

  // Gerer l'upload de fichier
  const handleFileUpload = useCallback((side, event) => {
    const file = event.target.files?.[0]
    if (!file || disabled) return

    const canvas = side === 'front' ? fabricFrontRef.current : fabricBackRef.current
    if (!canvas) return

    // Afficher la vue correspondante
    setActiveView(prev => ({ ...prev, [side]: true }))

    const fileType = file.type || ''
    const fileName = file.name.toLowerCase()

    // Gestion des PDFs
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const textObj = new fabric.FabricText('[PDF] ' + file.name.substring(0, 12) + (file.name.length > 12 ? '...' : ''), {
        fontSize: 12,
        fontWeight: '600',
        fill: '#666',
        left: 150,
        top: 180,
        originX: 'center',
        originY: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0'
      })
      canvas.add(textObj)
      canvas.setActiveObject(textObj)
      canvas.renderAll()
      return
    }

    // Gestion des images
    const reader = new FileReader()
    reader.onload = (evt) => {
      fabric.FabricImage.fromURL(evt.target.result).then((img) => {
        if (!img) return
        const scale = side === 'front' ? 80 / img.width : 160 / img.width
        img.scale(scale)
        img.set({
          left: 150,
          top: 180,
          originX: 'center',
          originY: 'center',
          padding: 25
        })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
      })
    }
    reader.readAsDataURL(file)

    // Reset input
    event.target.value = ''
  }, [disabled])

  // Mettre a jour la couleur des logos/textes
  useEffect(() => {
    [fabricFrontRef.current, fabricBackRef.current].forEach(canvas => {
      if (canvas) {
        canvas.forEachObject(obj => {
          if (obj.type === 'text' || obj.type === 'i-text') {
            obj.set('fill', logoColor)
          }
        })
        canvas.renderAll()
      }
    })
  }, [logoColor])

  // Exposer methodes via ref
  useImperativeHandle(ref, () => ({
    getCanvasData: () => ({
      front: fabricFrontRef.current?.toDataURL({ format: 'png', quality: 1 }),
      back: fabricBackRef.current?.toDataURL({ format: 'png', quality: 1 })
    }),
    clearSelection: () => {
      fabricFrontRef.current?.discardActiveObject().renderAll()
      fabricBackRef.current?.discardActiveObject().renderAll()
    }
  }))

  return (
    <div className="space-y-6">
      {/* Selecteurs en ligne */}
      <div className="grid grid-cols-3 gap-4">
        {/* Taille */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Taille</label>
          <select
            value={size}
            onChange={(e) => onSizeChange?.(e.target.value)}
            disabled={disabled}
            className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
          >
            {SIZES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Couleur T-shirt */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Couleur T-Shirt</label>
          <select
            value={tshirtColor}
            onChange={(e) => onTshirtColorChange?.(e.target.value)}
            disabled={disabled}
            className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
          >
            {TSHIRT_COLORS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Couleur Logo */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Couleur Logo</label>
          <select
            value={logoColor}
            onChange={(e) => onLogoColorChange?.(e.target.value)}
            disabled={disabled}
            className="input-field disabled:bg-stone-100 disabled:cursor-not-allowed"
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

      {/* Boutons d'upload */}
      {!disabled && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputFrontRef.current?.click()}
            className="py-3 px-4 bg-stone-900 text-white rounded-xl font-medium text-sm
                       hover:bg-stone-800 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importer logo AV
          </button>
          <button
            onClick={() => fileInputBackRef.current?.click()}
            className="py-3 px-4 bg-stone-900 text-white rounded-xl font-medium text-sm
                       hover:bg-stone-800 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importer logo AR
          </button>
        </div>
      )}

      {/* Inputs fichiers caches */}
      <input
        ref={fileInputFrontRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.svg,.webp,.pdf,image/*"
        onChange={(e) => handleFileUpload('front', e)}
      />
      <input
        ref={fileInputBackRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.svg,.webp,.pdf,image/*"
        onChange={(e) => handleFileUpload('back', e)}
      />

      {/* Zone AVANT */}
      {activeView.front && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-stone-500 uppercase">Logo AVANT</span>
            {!disabled && (
              <select
                className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white"
                onChange={(e) => {
                  if (e.target.value) {
                    addPresetText('front', e.target.value)
                    e.target.value = ''
                  }
                }}
                defaultValue=""
              >
                <option value="">+ Ajouter logo</option>
                {PRESET_LOGOS.map(logo => (
                  <option key={logo} value={logo}>{logo}</option>
                ))}
              </select>
            )}
          </div>
          <div className="relative w-[300px] h-[350px] mx-auto bg-gradient-to-br from-stone-50 to-stone-100
                          rounded-2xl border border-stone-200 overflow-hidden shadow-inner">
            <TshirtSvgFront color={tshirtColor} />
            <canvas ref={canvasFrontRef} className="relative z-10" />
          </div>
        </div>
      )}

      {/* Zone ARRIERE */}
      {activeView.back && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-stone-500 uppercase">Logo ARRIERE</span>
            {!disabled && (
              <select
                className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white"
                onChange={(e) => {
                  if (e.target.value) {
                    addPresetText('back', e.target.value)
                    e.target.value = ''
                  }
                }}
                defaultValue=""
              >
                <option value="">+ Ajouter logo</option>
                {PRESET_LOGOS.map(logo => (
                  <option key={logo} value={logo}>{logo}</option>
                ))}
              </select>
            )}
          </div>
          <div className="relative w-[300px] h-[350px] mx-auto bg-gradient-to-br from-stone-50 to-stone-100
                          rounded-2xl border border-stone-200 overflow-hidden shadow-inner">
            <TshirtSvgBack color={tshirtColor} />
            <canvas ref={canvasBackRef} className="relative z-10" />
          </div>
        </div>
      )}
    </div>
  )
})

export default TshirtEditor
