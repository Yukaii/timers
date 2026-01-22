"use client"

import React, { useRef, useEffect, useCallback } from "react"
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
  const isInternalChange = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Create a large repeated list to simulate infinity
  const REPETITIONS = 100
  const totalItems = items.length * REPETITIONS
  const centerOffset = Math.floor(REPETITIONS / 2) * items.length

  // Sync scroll position with value
  useEffect(() => {
    const container = scrollRef.current
    if (!container || isInternalChange.current) {
      isInternalChange.current = false
      return
    }

    const targetIndex = centerOffset + value
    const targetScroll = targetIndex * itemHeight
    container.scrollTop = targetScroll
  }, [value, itemHeight, centerOffset])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

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
  }, [items.length, itemHeight, onChange, value])

  const displayItems = Array.from({ length: totalItems }, (_, i) => items[i % items.length])

  return (
    <div 
      className={`relative overflow-hidden select-none group ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      style={{ height: `${height}px`, width: "clamp(120px, 20vw, 200px)" }}
    >
      {/* Idle Hint Animation - Large explicit arrows indicating scrollability */}
      <div className="absolute left-0 inset-y-0 flex flex-col items-center justify-between py-8 pointer-events-none z-20 transition-all duration-500 group-hover:opacity-0 group-hover:translate-x-[-20px]">
        <ChevronUp className="w-8 h-8 text-foreground animate-explicit-bounce" style={{ animationDelay: '0s' }} />
        <ChevronDown className="w-8 h-8 text-foreground animate-explicit-bounce" style={{ animationDelay: '-1s' }} />
      </div>

      {/* Selection Highlight Area */}
      <div 
        className="absolute inset-x-0 border-y border-border/20 bg-muted/5 pointer-events-none z-10"
        style={{ 
          top: `${(height - itemHeight) / 2}px`, 
          height: `${itemHeight}px` 
        }}
      />
      
      {/* Fading Gradients */}
      <div 
        className="absolute inset-x-0 top-0 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-10"
        style={{ height: `${(height - itemHeight) / 2}px` }}
      />
      <div 
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10"
        style={{ height: `${(height - itemHeight) / 2}px` }}
      />

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
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
            <div
              key={`${i}-${item}`}
              className={`flex items-center justify-center snap-center transition-all duration-200 tabular-nums ${
                isSelected
                  ? "text-6xl sm:text-7xl font-light text-foreground" 
                  : "text-3xl sm:text-4xl text-muted-foreground/40 font-extralight"
              }`}
              style={{ 
                height: `${itemHeight}px`,
              }}
            >
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}
