"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"
import { searchCities } from "@/lib/us-cities-data"

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  id?: string
  className?: string
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "City, State",
  required,
  id,
  className = ""
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use memoized search results
  const suggestions = useMemo(() => {
    if (value.length < 2) return []
    return searchCities(value, 8)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Open/close dropdown based on suggestions
  useEffect(() => {
    setIsOpen(suggestions.length > 0 && value.length >= 2)
    setHighlightedIndex(-1)
  }, [suggestions, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <strong key={i} className="text-gray-900">{part}</strong> : 
            <span key={i}>{part}</span>
        )}
      </span>
    )
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          required={required}
          className="pl-10 pr-3"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => {
            const [city, state] = suggestion.split(', ')
            return (
              <div
                key={`${suggestion}-${index}`}
                className={`px-4 py-2.5 cursor-pointer transition-colors ${
                  index === highlightedIndex 
                    ? "bg-blue-50 text-blue-900" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">
                      {highlightMatch(city, value)}
                    </span>
                    {state && (
                      <span className="text-gray-500 ml-1">
                        , {state}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div className="px-4 py-2 text-xs text-gray-500 border-t">
            {suggestions.length === 8 ? 'Showing top 8 results' : `${suggestions.length} results`}
          </div>
        </div>
      )}
    </div>
  )
}