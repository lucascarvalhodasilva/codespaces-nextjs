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

export default function ComboBox({
  id,
  label,
  name,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select option',
  helperText,
  disabled = false,
  className = '',
  noOptionsMessage = 'No matches yet'
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listboxId = `${inputId}-listbox`
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value ?? '')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    setInputValue(value ?? '')
  }, [value])

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

  const filteredOptions = useMemo(() => {
    if (!inputValue) return normalizedOptions
    const query = inputValue.trim().toLowerCase()
    return normalizedOptions.filter((option) => option.label.toLowerCase().includes(query))
  }, [normalizedOptions, inputValue])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [inputValue, normalizedOptions.length])

  const handleInputChange = (event) => {
    const nextValue = event.target.value
    setInputValue(nextValue)
    onChange?.(nextValue)
    setIsOpen(true)
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

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
        return next >= filteredOptions.length ? 0 : next
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setHighlightedIndex((prev) => {
        const next = prev - 1
        return next < 0 ? Math.max(filteredOptions.length - 1, 0) : next
      })
    } else if (event.key === 'Enter') {
      if (isOpen && filteredOptions[highlightedIndex]) {
        event.preventDefault()
        selectOption(filteredOptions[highlightedIndex])
      }
    } else if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault()
        setIsOpen(false)
      }
    }
  }

  const selectOption = (option) => {
    const nextValue = option.label ?? option.value ?? ''
    setInputValue(nextValue)
    onChange?.(nextValue)
    setIsOpen(false)
  }

  const rootClass = ['space-y-2', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="block text-sm text-primary-light/80 mb-1">
          {label}
        </label>
      )}
      <div className={`relative ${disabled ? 'opacity-60' : ''}`}>
        <div
          className={`flex items-center rounded-lg border ${
            isOpen ? 'border-primary/80' : 'border-primary/30'
          } bg-primary-darkest/50 pr-2 pl-3 py-1.5 text-primary-light shadow-inner focus-within:border-primary`}
        >
          <input
            id={inputId}
            name={name}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-primary-light placeholder:text-primary-light/40 focus:outline-none"
            role="combobox"
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-activedescendant={isOpen && filteredOptions[highlightedIndex] ? `${listboxId}-option-${highlightedIndex}` : undefined}
          />
          <button
            type="button"
            onClick={handleToggle}
            className="p-1.5 rounded-md text-primary-light/60 hover:text-primary-light focus:outline-none"
            tabIndex={-1}
            aria-label={isOpen ? 'Close options' : 'Open options'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
        </div>
        {isOpen && (
          <div
            className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-primary/30 bg-primary-dark shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          >
            {filteredOptions.length > 0 ? (
              <ul
                id={listboxId}
                role="listbox"
                ref={listRef}
                className="max-h-60 overflow-y-auto thin-scrollbar py-2"
              >
                {filteredOptions.map((option, index) => {
                  const isActive = index === highlightedIndex
                  return (
                    <li
                      key={`${option.value}-${index}`}
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-primary/15 text-primary'
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
      {helperText && (
        <p className="text-xs text-primary-light/50">{helperText}</p>
      )}
    </div>
  )
}
