'use client'

export default function FormModal({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  onClose
}) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-primary-dark rounded-2xl border border-primary/30 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-[0_25px_55px_rgba(0,0,0,0.55)] mx-4 my-6 md:mx-0">
        <div className="sticky top-0 z-10 bg-primary-dark border-b border-primary/30 px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-light/40">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-2xl font-semibold text-primary-light">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-primary-light/60 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-primary-light/60 hover:text-primary-light text-2xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto thin-scrollbar px-6 py-6">
          {children}
        </div>

        {footer && (
          <div className="border-t border-primary/30 bg-primary-dark px-6 py-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
