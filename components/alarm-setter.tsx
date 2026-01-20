"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AlarmSetterProps {
  hour: number
  minute: number
  onHourChange: (hour: number) => void
  onMinuteChange: (minute: number) => void
  disabled?: boolean
}

export function AlarmSetter({ hour, minute, onHourChange, onMinuteChange, disabled }: AlarmSetterProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Hour */}
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onHourChange((hour + 1) % 24)}
          disabled={disabled}
          className="rounded-full h-8 w-8"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <div className="text-3xl font-light tabular-nums min-w-[60px] text-center">
          {hour.toString().padStart(2, "0")}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onHourChange((hour - 1 + 24) % 24)}
          disabled={disabled}
          className="rounded-full h-8 w-8"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      <span className="text-3xl font-light">:</span>

      {/* Minute */}
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMinuteChange((minute + 1) % 60)}
          disabled={disabled}
          className="rounded-full h-8 w-8"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <div className="text-3xl font-light tabular-nums min-w-[60px] text-center">
          {minute.toString().padStart(2, "0")}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMinuteChange((minute - 1 + 60) % 60)}
          disabled={disabled}
          className="rounded-full h-8 w-8"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      <span className="text-sm text-muted-foreground ml-2">target</span>
    </div>
  )
}
