import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check, ChevronUp } from 'lucide-react'

/**
 * Select iOS-style basé sur Radix UI
 * Supporte les pastilles de couleur dans les options
 */
export default function IOSSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Choisir',
  colorDot = false,
}) {
  const selectedOption = options.find(o => o.value === value)

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className="flex items-center gap-2 outline-none cursor-pointer group min-w-0"
        aria-label={placeholder}
      >
        <div className="flex items-center gap-2 min-w-0">
          {colorDot && selectedOption?.hex && (
            <span
              className="w-5 h-5 rounded-full shrink-0 ring-1 ring-black/10"
              style={{ backgroundColor: selectedOption.hex }}
            />
          )}
          <span className="text-[15px] sm:text-[17px] text-[#86868B] truncate">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <Select.Icon>
          <ChevronDown size={14} className="text-[#C7C7CC] shrink-0" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-[100] overflow-hidden bg-white rounded-2xl shadow-2xl border border-[#E5E5EA]/50
                     ios-select-content"
          position="popper"
          sideOffset={6}
          align="end"
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-7 bg-white">
            <ChevronUp size={14} className="text-[#86868B]" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1.5">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] text-[#1D1D1F]
                           outline-none select-none cursor-pointer
                           data-[highlighted]:bg-[#F2F2F7] transition-colors"
              >
                {colorDot && opt.hex && (
                  <span
                    className="w-5 h-5 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: opt.hex }}
                  />
                )}
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="ml-auto">
                  <Check size={16} className="text-[#007AFF]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-7 bg-white">
            <ChevronDown size={14} className="text-[#86868B]" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
