'use client'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const ConfirmationContext = createContext(null)

export function useConfirmation() {
  const ctx = useContext(ConfirmationContext)
  if (!ctx) {
    throw new Error('useConfirmation must be used within ConfirmationProvider')
  }
  return ctx
}

const DEFAULTS = {
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'danger'
}

export default function ConfirmationProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const confirmButtonRef = useRef(null)

  const requestConfirmation = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({ ...DEFAULTS, ...options, resolve })
    })
  }, [])

  const closeDialog = useCallback((result) => {
    if (dialog?.resolve) {
      dialog.resolve(result)
    }
    setDialog(null)
  }, [dialog])

  useEffect(() => {
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDialog(false)
      }
      if (event.key === 'Enter' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault()
        closeDialog(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    const timer = requestAnimationFrame(() => {
      confirmButtonRef.current?.focus()
    })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(timer)
    }
  }, [dialog, closeDialog])

  return (
    <ConfirmationContext.Provider value={requestConfirmation}>
      {children}
      {dialog && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-primary-dark border border-primary/30 rounded-2xl shadow-2xl">
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary-light/50">
                  {dialog.tone === 'danger' ? 'Caution' : 'Confirm'}
                </p>
                <h2 className="text-2xl font-semibold text-primary-light mt-1">{dialog.title}</h2>
              </div>
              <p className="text-sm text-primary-light/70 leading-relaxed">{dialog.message}</p>
              {dialog.details && (
                <div className="p-3 rounded-lg bg-primary-darkest/70 border border-primary/20 text-xs text-primary-light/60">
                  {dialog.details}
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => closeDialog(false)}
                  className="px-4 py-2 rounded-lg border border-primary/30 text-primary-light/80 hover:text-primary-light hover:border-primary/60 transition-colors"
                >
                  {dialog.cancelLabel}
                </button>
                <button
                  type="button"
                  ref={confirmButtonRef}
                  onClick={() => closeDialog(true)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    dialog.tone === 'danger'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                      : 'bg-primary text-primary-darkest hover:bg-primary/90 border border-primary/70'
                  }`}
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmationContext.Provider>
  )
}
