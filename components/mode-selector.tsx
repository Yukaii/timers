"use client"

import { Clock, Timer, Hourglass, AlarmClock } from "lucide-react"

type Mode = "stopwatch" | "clock" | "countdown" | "alarm"

interface ModeSelectorProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

const modes: { value: Mode; label: string; icon: typeof Clock }[] = [
  { value: "clock", label: "Time", icon: Clock },
  { value: "stopwatch", label: "Stopwatch", icon: Timer },
  { value: "countdown", label: "Countdown", icon: Hourglass },
  { value: "alarm", label: "Alarm", icon: AlarmClock },
]

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-secondary/50">
      {modes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            mode === value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
