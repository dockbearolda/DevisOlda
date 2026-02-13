import { useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'

/**
 * Composant upload de fichier image avec preview
 * @param {string} label - "Avant" ou "Arrière"
 * @param {string|null} preview - URL base64 de la preview
 * @param {function} onChange - callback(base64String | null)
 */
export default function FileUpload({ label, preview, onChange }) {
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      onClick={() => !preview && inputRef.current?.click()}
      className={`
        relative flex items-center gap-3 p-3 rounded-xl border-2 border-dashed
        transition-all duration-150 min-h-[56px]
        ${preview
          ? 'border-gray-300 bg-gray-50'
          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt={`Logo ${label}`}
            className="w-10 h-10 object-contain rounded"
          />
          <span className="text-sm text-gray-700 flex-1 truncate">Logo {label}</span>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Image size={18} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Logo {label}</p>
            <p className="text-xs text-gray-400">Cliquer pour importer</p>
          </div>
          <Upload size={16} className="text-gray-400" />
        </>
      )}
    </div>
  )
}
