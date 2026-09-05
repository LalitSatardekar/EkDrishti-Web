import { createPortal } from 'react-dom'

const SuccessPopup = ({
  isOpen,
  title = 'Message sent',
  message = "Thanks for reaching out. We'll get back to you within 24 hours.",
  onClose,
}) => {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-surface border border-amber-500/20 p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30">
          <svg
            className="h-8 w-8 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-heading font-bold text-textPrimary mb-2">
          {title}
        </h3>
        <p className="text-textSecondary text-sm mb-6">
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  )
}

export default SuccessPopup
