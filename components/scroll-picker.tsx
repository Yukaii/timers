"use client"

import React, { useRef, useEffect, useCallback, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ScrollPickerProps {
  items: string[]
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  height?: number
  itemHeight?: number
}

export function ScrollPicker({
  items,
  value,
  onChange,
  disabled = false,
  height = 320,
  itemHeight = 80,
}: ScrollPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isInternalChange = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  
  // Create a large repeated list to simulate infinity
  const REPETITIONS = 100
  const totalItems = items.length * REPETITIONS
  const centerOffset = Math.floor(REPETITIONS / 2) * items.length

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Sync scroll position with value
  useEffect(() => {
    const container = scrollRef.current
    if (!container || isInternalChange.current || isEditing) {
      isInternalChange.current = false
      return
    }

    const targetIndex = centerOffset + value
    const targetScroll = targetIndex * itemHeight
    container.scrollTop = targetScroll
  }, [value, itemHeight, centerOffset, isEditing])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container || isEditing) return

    const scrollTop = container.scrollTop
    const rawIndex = Math.round(scrollTop / itemHeight)
    const actualIndex = rawIndex % items.length
    
    // Handle negative modulo if it happens
    const normalizedIndex = (actualIndex + items.length) % items.length

    if (normalizedIndex !== value) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      
      timeoutRef.current = setTimeout(() => {
        isInternalChange.current = true
        onChange(normalizedIndex)
      }, 50)
    }
  }, [items.length, itemHeight, onChange, value, isEditing])

  const handleStartEdit = () => {
    if (disabled) return
    setIsEditing(true)
    setEditValue(items[value])
  }

  const handleEditSubmit = () => {
    setIsEditing(false)
    const num = Number.parseInt(editValue, 10)
    if (!Number.isNaN(num)) {
      // Clamp to range
      const clamped = Math.max(0, Math.min(num, items.length - 1))
      onChange(clamped)
    }
  }

  const displayItems = Array.from({ length: totalItems }, (_, i) => items[i % items.length])

  const handleItemClick = (i: number) => {
    const isSelected = (i % items.length) === value && 
                      Math.abs(i - (scrollRef.current ? Math.round(scrollRef.current.scrollTop / itemHeight) : (centerOffset + value))) < items.length;

    if (!isEditing) {
      if (isSelected) {
        handleStartEdit()
      } else if (scrollRef.current) {
        scrollRef.current.scrollTop = i * itemHeight
      }
    }
  }

  return (
    <div 
      className={`relative overflow-hidden select-none group ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      style={{ height: `${height}px`, width: "clamp(120px, 20vw, 200px)" }}
    >
      {/* Idle Hint Animation - Large explicit arrows indicating scrollability */}
      {!isEditing && (
        <div className="absolute left-0 inset-y-0 flex flex-col items-center justify-between py-8 pointer-events-none z-20 transition-all duration-500 group-hover:opacity-0 group-hover:translate-x-[-20px]">
          <ChevronUp className="w-8 h-8 text-foreground animate-explicit-bounce" style={{ animationDelay: '0s' }} />
          <ChevronDown className="w-8 h-8 text-foreground animate-explicit-bounce" style={{ animationDelay: '-1s' }} />
        </div>
      )}

      {/* Selection Highlight Area */}
      <button 
        type="button"
        className={`absolute inset-x-0 border-y border-border/20 bg-muted/5 z-10 cursor-text ${isEditing ? "" : "pointer-events-none"}`}
        style={{ 
          top: `${(height - itemHeight) / 2}px`, 
          height: `${itemHeight}px` 
        }}
        onClick={() => !isEditing && handleStartEdit()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (!isEditing) handleStartEdit()
          }
        }}
      >
        <span className="sr-only">Click to edit</span>
      </button>
      
      {/* Fading Gradients */}
      <div 
        className="absolute inset-x-0 top-0 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-10"
        style={{ height: `${(height - itemHeight) / 2}px` }}
      />
      <div 
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10"
        style={{ height: `${(height - itemHeight) / 2}px` }}
      />

      {/* Direct Input Overlay */}
      {isEditing && (
        <div 
          className="absolute inset-x-0 z-30 flex items-center justify-center"
          style={{ 
            top: `${(height - itemHeight) / 2}px`, 
            height: `${itemHeight}px` 
          }}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onBlur={handleEditSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditSubmit()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            className="w-full h-full bg-background text-6xl sm:text-7xl font-light text-foreground text-center outline-none border-none p-0 tabular-nums"
          />
        </div>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className={`h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth ${isEditing ? "opacity-0" : ""}`}
        onScroll={handleScroll}
        style={{ 
          scrollPaddingBlock: `${(height - itemHeight) / 2}px`,
          paddingTop: `${(height - itemHeight) / 2}px`,
          paddingBottom: `${(height - itemHeight) / 2}px`
        }}
      >
        {displayItems.map((item, i) => {
          const isSelected = (i % items.length) === value && 
                            Math.abs(i - (scrollRef.current ? Math.round(scrollRef.current.scrollTop / itemHeight) : (centerOffset + value))) < items.length;
          
          return (
            <button
              key={`${i}-${item}`}
              type="button"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleItemClick(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleItemClick(i)
                }
              }}
              className={`w-full flex items-center justify-center snap-center transition-all duration-200 tabular-nums cursor-pointer border-none bg-transparent p-0 outline-none ${
                isSelected
                  ? "text-6xl sm:text-7xl font-light text-foreground" 
                  : "text-3xl sm:text-4xl text-muted-foreground/40 font-extralight"
              }`}
              style={{ 
                height: `${itemHeight}px`,
              }}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}

