'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

function normalizeOptions(options = []) {
  return options.map((option) => {
    if (typeof option === 'string') {
      return { label: option, value: option }
    }
    if (option && typeof option === 'object') {
      return {
        label: option.label ?? option.value ?? '',
        value: option.value ?? option.label ?? ''
      }
    }
    return { label: '', value: '' }
  })
}

export default function Select({
  id,
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  helperText,
  disabled = false,
  className = '',
  renderLabel,
  noOptionsMessage = 'No options'
}) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const listboxId = `${selectId}-listbox`
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    const currentIndex = normalizedOptions.findIndex((option) => option.value === value)
    return currentIndex >= 0 ? currentIndex : 0
  })
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const selectedOption = useMemo(
    () => normalizedOptions.find((option) => option.value === value) || null,
    [normalizedOptions, value]
  )

  useEffect(() => {
    const nextIndex = normalizedOptions.findIndex((option) => option.value === value)
    setHighlightedIndex(nextIndex >= 0 ? nextIndex : 0)
  }, [normalizedOptions, value])

  useEffect(() => {
    if (!isOpen) return undefined
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !listRef.current) return
    const activeOption = listRef.current.querySelector('[data-active="true"]')
    if (activeOption && activeOption.scrollIntoView) {
      activeOption.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, isOpen])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen((prev) => !prev)
  }

  const handleKeyDown = (event) => {
    if (disabled) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setHighlightedIndex((prev) => {
        const next = prev + 1
        return next >= normalizedOptions.length ? 0 : next
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setHighlightedIndex((prev) => {
        const next = prev - 1
        return next < 0 ? Math.max(normalizedOptions.length - 1, 0) : next
      })
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isOpen && normalizedOptions[highlightedIndex]) {
        selectOption(normalizedOptions[highlightedIndex])
      } else {
        setIsOpen(true)
      }
    } else if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault()
        setIsOpen(false)
      }
    }
  }

  const selectOption = (option) => {
    if (!option) return
    onChange?.(option.value, option)
    setIsOpen(false)
  }

  const displayValue = renderLabel ? renderLabel(selectedOption) : selectedOption?.label
  const showPlaceholder = !displayValue
  const rootClass = ['space-y-2', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="block text-sm text-primary-light/80 mb-1">
          {label}
        </label>
      )}
      <div className={`relative ${disabled ? 'opacity-60' : ''}`}>
        <button
          type="button"
          id={selectId}
          name={name}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center justify-between rounded-lg border ${
            isOpen ? 'border-primary/80' : 'border-primary/30'
          } bg-primary-darkest/50 px-3 py-2 text-sm text-left text-primary-light transition-colors focus:outline-none focus:border-primary`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          disabled={disabled}
        >
          <span className={showPlaceholder ? 'text-primary-light/40' : ''}>
            {showPlaceholder ? placeholder : displayValue}
          </span>
          <svg
            className={`w-4 h-4 text-primary-light/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-primary/30 bg-primary-dark shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
            {normalizedOptions.length ? (
              <ul
                id={listboxId}
                role="listbox"
                ref={listRef}
                className="max-h-60 overflow-y-auto thin-scrollbar py-2"
              >
                {normalizedOptions.map((option, index) => {
                  const isActive = index === highlightedIndex
                  return (
                    <li
                      key={`${option.value}-${index}`}
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={option.value === value}
                      data-active={isActive}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                        option.value === value
                          ? 'bg-primary/15 text-primary'
                          : isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-primary-light/80 hover:text-primary hover:bg-primary/10'
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectOption(option)}
                    >
                      {option.label}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-primary-light/60">{noOptionsMessage}</div>
            )}
          </div>
        )}
      </div>
      {helperText && <p className="text-xs text-primary-light/50">{helperText}</p>}
    </div>
  )
}
