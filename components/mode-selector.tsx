"use client"

import { Clock, Timer, Hourglass, AlarmClock } from "lucide-react"

type Mode = "stopwatch" | "clock" | "countdown" | "alarm"

interface ModeSelectorProps {
  mode: Mode
  onChange: (mode: Mode) => void
  showShortcutHints?: boolean
}

const modes: { value: Mode; label: string; icon: typeof Clock; shortcut: string; number: string }[] = [
  { value: "clock", label: "Time", icon: Clock, shortcut: "t", number: "1" },
  { value: "stopwatch", label: "Stopwatch", icon: Timer, shortcut: "s", number: "2" },
  { value: "countdown", label: "Countdown", icon: Hourglass, shortcut: "c", number: "3" },
  { value: "alarm", label: "Alarm", icon: AlarmClock, shortcut: "a", number: "4" },
]

export function ModeSelector({ mode, onChange, showShortcutHints = false }: ModeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-secondary/50">
      {modes.map(({ value, label, icon: Icon, shortcut, number }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            mode === value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
          
          {showShortcutHints && (
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-1 ring-background">
                {shortcut}
              </span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-1 ring-background sm:hidden">
                {number}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
