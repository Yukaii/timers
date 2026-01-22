"use client"

import React from "react"
import { ScrollPicker } from "./scroll-picker"

interface TimePickerWheelProps {
  hour: number
  minute: number
  onHourChange: (hour: number) => void
  onMinuteChange: (minute: number) => void
  disabled?: boolean
}

export function TimePickerWheel({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  disabled = false,
}: TimePickerWheelProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 relative z-0">
      <div className="flex flex-col items-center">
        <ScrollPicker
          items={hours}
          value={hour}
          onChange={onHourChange}
          disabled={disabled}
        />
      </div>
      <div className="text-6xl sm:text-7xl font-extralight text-muted-foreground/30 mt-[-8px]">:</div>
      <div className="flex flex-col items-center">
        <ScrollPicker
          items={minutes}
          value={minute}
          onChange={onMinuteChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
