"use client"

import React, { useRef, useEffect, useCallback } from "react"

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

  // Sync scroll position with value
  useEffect(() => {
    const container = scrollRef.current
    if (!container || isInternalChange.current) {
      isInternalChange.current = false
      return
    }

    const targetScroll = value * itemHeight
    if (Math.abs(container.scrollTop - targetScroll) > 1) {
      container.scrollTo({ top: targetScroll, behavior: "smooth" })
    }
  }, [value, itemHeight])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const scrollTop = container.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    
    if (index >= 0 && index < items.length && index !== value) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      
      timeoutRef.current = setTimeout(() => {
        isInternalChange.current = true
        onChange(index)
      }, 50)
    }
  }, [items.length, itemHeight, onChange, value])

  return (
    <div 
      className={`relative overflow-hidden select-none ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      style={{ height: `${height}px`, width: "clamp(120px, 20vw, 200px)" }}
    >
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
        {items.map((item) => (
          <div
            key={item}
            className={`flex items-center justify-center snap-center transition-all duration-200 tabular-nums ${
              value === items.indexOf(item) 
                ? "text-6xl sm:text-7xl font-light text-foreground" 
                : "text-3xl sm:text-4xl text-muted-foreground/40 font-extralight"
            }`}
            style={{ 
              height: `${itemHeight}px`,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
