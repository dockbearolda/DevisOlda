import { Check } from 'lucide-react'

/**
 * Palette de couleurs visuelle cliquable
 * @param {Array} colors - [{name, hex}]
 * @param {string} selected - hex de la couleur sélectionnée
 * @param {function} onChange - callback(hex)
 */
export default function ColorPicker({ colors, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const isSelected = selected === color.hex
        const isLight = isLightColor(color.hex)
        return (
          <button
            key={color.hex}
            type="button"
            title={color.name}
            onClick={() => onChange(color.hex)}
            className={`
              relative w-9 h-9 rounded-full border-2 transition-all duration-150
              hover:scale-110 active:scale-95
              ${isSelected
                ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                : isLight
                  ? 'border-gray-300 hover:border-gray-400'
                  : 'border-transparent hover:border-gray-400'
              }
            `}
            style={{ backgroundColor: color.hex }}
          >
            {isSelected && (
              <Check
                size={16}
                className={`absolute inset-0 m-auto ${isLight ? 'text-gray-800' : 'text-white'}`}
                strokeWidth={3}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}
