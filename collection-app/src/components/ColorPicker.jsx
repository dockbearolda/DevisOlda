import { Check } from 'lucide-react'

/**
 * Palette de couleurs style Apple — cercles avec check
 */
export default function ColorPicker({ colors, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5">
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
              relative w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform duration-150
              active:scale-90
              ${isSelected
                ? 'ring-2 ring-[#007AFF] ring-offset-2'
                : ''
              }
              ${isLight && !isSelected ? 'ring-1 ring-[#E5E5EA]' : ''}
            `}
            style={{ backgroundColor: color.hex }}
          >
            {isSelected && (
              <Check
                size={14}
                className={`absolute inset-0 m-auto ${isLight ? 'text-[#1D1D1F]' : 'text-white'}`}
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
