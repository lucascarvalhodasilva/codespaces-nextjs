'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const push = useCallback((message, options = {}) => {
    const id = ++idCounter
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 3500
    }
    setToasts(t => [...t, toast])
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration)
    }
    return id
  }, [remove])

  const value = { push, remove }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Viewport */}
      <div className="fixed top-6 right-6 z-50 space-y-3 w-[260px]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium border animate-fadeIn flex items-start gap-2 ${
              t.type === 'success' ? 'bg-green-500/15 border-green-500/40 text-green-300' :
              t.type === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-300' :
              t.type === 'warn' ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' :
              'bg-primary-dark border-primary/30 text-primary-light'
            }`}
          >
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-xs opacity-70 hover:opacity-100 transition-colors"
            >×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
