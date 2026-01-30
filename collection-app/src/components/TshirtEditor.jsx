import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'

// Composant Logo Draggable et Redimensionnable
function DraggableLogo({
  src,
  isText = false,
  textContent = '',
  logoColor = '#000000',
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 100, height: 100 },
  minSize = 40,
  maxSize = 200,
  containerRef,
  onRemove,
  onPositionChange,
  disabled = false,
  side = 'front'
}) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const logoRef = useRef(null)

  // Mettre a jour la position si initialPosition change
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
    }
  }, [initialPosition.x, initialPosition.y])

  // Mettre a jour la taille si initialSize change
  useEffect(() => {
    if (initialSize) {
      setSize(initialSize)
    }
  }, [initialSize.width, initialSize.height])

  // Calculer les limites du container
  const getContainerBounds = useCallback(() => {
    if (!containerRef?.current) return { minX: 55, maxX: 245, minY: 70, maxY: 290 }
    return {
      minX: 55,
      maxX: 245,
      minY: 70,
      maxY: 290
    }
  }, [containerRef])

  // Gestion du drag
  const handleMouseDown = useCallback((e) => {
    if (disabled || isResizing) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }, [disabled, isResizing, position])

  const handleMouseMove = useCallback((e) => {
    if (isDragging && !disabled) {
      const bounds = getContainerBounds()
      const newX = Math.max(bounds.minX, Math.min(bounds.maxX - size.width, e.clientX - dragStart.x))
      const newY = Math.max(bounds.minY, Math.min(bounds.maxY - size.height, e.clientY - dragStart.y))
      setPosition({ x: newX, y: newY })
    }
    if (isResizing && !disabled) {
      const deltaX = e.clientX - resizeStart.x
      // Garder les proportions
      const aspectRatio = resizeStart.width / resizeStart.height
      let newWidth = Math.max(minSize, Math.min(maxSize, resizeStart.width + deltaX))
      let newHeight = newWidth / aspectRatio

      if (newHeight > maxSize) {
        newHeight = maxSize
        newWidth = newHeight * aspectRatio
      }
      if (newHeight < minSize) {
        newHeight = minSize
        newWidth = newHeight * aspectRatio
      }

      setSize({ width: newWidth, height: newHeight })
    }
  }, [isDragging, isResizing, disabled, dragStart, resizeStart, getContainerBounds, size.width, size.height, minSize, maxSize])

  const handleMouseUp = useCallback(() => {
    // Notifier le changement de position/taille
    if ((isDragging || isResizing) && onPositionChange) {
      onPositionChange({ position, size })
    }
    setIsDragging(false)
    setIsResizing(false)
  }, [isDragging, isResizing, position, size, onPositionChange])

  // Gestion du resize
  const handleResizeStart = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setIsResizing(true)
    setResizeStart({
      x: clientX,
      y: clientY,
      width: size.width,
      height: size.height
    })
  }, [disabled, size])

  // Touch support
  const handleTouchStart = useCallback((e) => {
    if (disabled || isResizing) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    })
  }, [disabled, isResizing, position])

  const handleTouchMove = useCallback((e) => {
    if (isResizing && !disabled) {
      e.preventDefault()
      const touch = e.touches[0]
      const deltaX = touch.clientX - resizeStart.x
      const aspectRatio = resizeStart.width / resizeStart.height
      let newWidth = Math.max(minSize, Math.min(maxSize, resizeStart.width + deltaX))
      let newHeight = newWidth / aspectRatio
      if (newHeight > maxSize) { newHeight = maxSize; newWidth = newHeight * aspectRatio }
      if (newHeight < minSize) { newHeight = minSize; newWidth = newHeight * aspectRatio }
      setSize({ width: newWidth, height: newHeight })
      return
    }
    if (isDragging && !disabled) {
      e.preventDefault()
      const touch = e.touches[0]
      const bounds = getContainerBounds()
      const newX = Math.max(bounds.minX, Math.min(bounds.maxX - size.width, touch.clientX - dragStart.x))
      const newY = Math.max(bounds.minY, Math.min(bounds.maxY - size.height, touch.clientY - dragStart.y))
      setPosition({ x: newX, y: newY })
    }
  }, [isDragging, isResizing, disabled, dragStart, resizeStart, getContainerBounds, size.width, size.height, minSize, maxSize])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  // Event listeners globaux
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={logoRef}
      className={`absolute z-20 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${disabled ? 'pointer-events-none' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Bordure de selection */}
      {!disabled && (
        <div className={`absolute inset-0 border-2 rounded-lg pointer-events-none transition-all ${
          isDragging || isResizing ? 'border-blue-500 shadow-lg' : 'border-dashed border-stone-400 hover:border-stone-600'
        }`} />
      )}

      {/* Contenu du logo */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        {isText ? (
          <span
            className="font-black text-center leading-none"
            style={{
              color: logoColor,
              fontSize: `${Math.min(size.width, size.height) * 0.35}px`
            }}
          >
            {textContent}
          </span>
        ) : (
          <img
            src={src}
            alt="Logo"
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* Bouton de suppression - Croix rouge */}
      {!disabled && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full
                     flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200
                     hover:scale-110 z-30"
          title="Supprimer le logo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Poignee de redimensionnement */}
      {!disabled && (
        <div
          className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full cursor-se-resize
                     flex items-center justify-center shadow-lg transition-all hover:scale-110 z-30"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          style={{ touchAction: 'none' }}
          title="Redimensionner (proportionnel)"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      )}
    </div>
  )
}

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
  onLogoFrontPositionChange,
  onLogoBackPositionChange,
  logoFront,
  logoBack,
  logoFrontPosition,
  logoBackPosition
}, ref) {
  const [activeView, setActiveView] = useState({ front: true, back: false })
  const isDataUrl = (s) => s && typeof s === 'string' && s.startsWith('data:')
  const [selectedLogoFront, setSelectedLogoFront] = useState(() => {
    if (logoFront && !isDataUrl(logoFront)) return logoFront
    return ''
  })
  const [selectedLogoBack, setSelectedLogoBack] = useState(() => {
    if (logoBack && !isDataUrl(logoBack)) return logoBack
    return ''
  })
  const [uploadedImageFront, setUploadedImageFront] = useState(() => {
    if (isDataUrl(logoFront)) return logoFront
    return null
  })
  const [uploadedImageBack, setUploadedImageBack] = useState(() => {
    if (isDataUrl(logoBack)) return logoBack
    return null
  })
  const fileInputFrontRef = useRef(null)
  const fileInputBackRef = useRef(null)
  const containerFrontRef = useRef(null)
  const containerBackRef = useRef(null)

  // Gerer l'upload d'image
  const handleFileUpload = useCallback((side, event) => {
    const file = event.target.files?.[0]
    if (!file || disabled) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      if (side === 'front') {
        setUploadedImageFront(evt.target.result)
        setSelectedLogoFront('')
        onLogoFrontChange?.(evt.target.result)
      } else {
        setUploadedImageBack(evt.target.result)
        setSelectedLogoBack('')
        onLogoBackChange?.(evt.target.result)
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }, [disabled])

  // Supprimer une image ou un logo
  const handleRemoveImage = (side) => {
    if (side === 'front') {
      setUploadedImageFront(null)
      setSelectedLogoFront('')
      onLogoFrontChange?.(null)
    } else {
      setUploadedImageBack(null)
      setSelectedLogoBack('')
      onLogoBackChange?.(null)
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
          <div className="mb-4">
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Logo AVANT</label>
            <div className="flex gap-2">
              <select
                value={selectedLogoFront}
                onChange={(e) => {
                  setSelectedLogoFront(e.target.value)
                  setUploadedImageFront(null)
                  onLogoFrontChange?.(e.target.value || null)
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
            {!disabled && (uploadedImageFront || selectedLogoFront) && (
              <p className="text-xs text-stone-400 mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deplacez et redimensionnez le logo directement sur le t-shirt
              </p>
            )}
          </div>

          {/* Preview T-shirt AVANT */}
          <div
            ref={containerFrontRef}
            className="relative w-[300px] h-[350px] mx-auto bg-gradient-to-br from-stone-50 to-stone-100
                       rounded-2xl border border-stone-200 shadow-inner"
          >
            <TshirtSvgFront color={tshirtColor} />

            {/* Logo draggable et redimensionnable */}
            {(uploadedImageFront || selectedLogoFront) && (
              <DraggableLogo
                src={uploadedImageFront}
                isText={!uploadedImageFront && !!selectedLogoFront}
                textContent={selectedLogoFront}
                logoColor={logoColor}
                initialPosition={logoFrontPosition?.position || { x: 100, y: 120 }}
                initialSize={logoFrontPosition?.size || { width: 100, height: 100 }}
                minSize={40}
                maxSize={180}
                containerRef={containerFrontRef}
                onRemove={() => handleRemoveImage('front')}
                onPositionChange={onLogoFrontPositionChange}
                disabled={disabled}
                side="front"
              />
            )}

            {/* Indication zone de drop si vide */}
            {!uploadedImageFront && !selectedLogoFront && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center text-stone-400 p-4">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">Selectionnez un logo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone ARRIERE */}
      {activeView.back && (
        <div className="animate-fade-in">
          {/* Selection logo ARRIERE */}
          <div className="mb-4">
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Logo ARRIERE</label>
            <div className="flex gap-2">
              <select
                value={selectedLogoBack}
                onChange={(e) => {
                  setSelectedLogoBack(e.target.value)
                  setUploadedImageBack(null)
                  onLogoBackChange?.(e.target.value || null)
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
            {!disabled && (uploadedImageBack || selectedLogoBack) && (
              <p className="text-xs text-stone-400 mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deplacez et redimensionnez le logo directement sur le t-shirt
              </p>
            )}
          </div>

          {/* Preview T-shirt ARRIERE */}
          <div
            ref={containerBackRef}
            className="relative w-[300px] h-[350px] mx-auto bg-gradient-to-br from-stone-50 to-stone-100
                       rounded-2xl border border-stone-200 shadow-inner"
          >
            <TshirtSvgBack color={tshirtColor} />

            {/* Logo draggable et redimensionnable */}
            {(uploadedImageBack || selectedLogoBack) && (
              <DraggableLogo
                src={uploadedImageBack}
                isText={!uploadedImageBack && !!selectedLogoBack}
                textContent={selectedLogoBack}
                logoColor={logoColor}
                initialPosition={logoBackPosition?.position || { x: 75, y: 100 }}
                initialSize={logoBackPosition?.size || { width: 150, height: 150 }}
                minSize={50}
                maxSize={200}
                containerRef={containerBackRef}
                onRemove={() => handleRemoveImage('back')}
                onPositionChange={onLogoBackPositionChange}
                disabled={disabled}
                side="back"
              />
            )}

            {/* Indication zone de drop si vide */}
            {!uploadedImageBack && !selectedLogoBack && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center text-stone-400 p-4">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">Selectionnez un logo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default TshirtEditor
export { TshirtSvgFront, TshirtSvgBack, TSHIRT_COLORS, LOGO_COLORS }
