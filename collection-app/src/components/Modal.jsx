import { useEffect, useRef } from 'react'

function Modal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Oui', cancelText = 'Non' }) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in"
      >
        <h3 className="text-xl font-bold text-stone-900 text-center mb-4">
          {title}
        </h3>

        <p className="text-stone-600 text-center mb-8">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 bg-stone-200 text-stone-700 font-bold rounded-xl
                       hover:bg-stone-300 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 py-4 px-6 bg-stone-900 text-white font-bold rounded-xl
                       hover:bg-stone-800 transition-all duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
