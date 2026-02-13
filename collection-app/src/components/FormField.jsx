/**
 * Wrapper réutilisable pour un champ de formulaire avec label
 */
export default function FormField({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
