"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimerControlsProps {
  isRunning: boolean
  onToggle: () => void
  onReset: () => void
}

export function TimerControls({ isRunning, onToggle, onReset }: TimerControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        className="rounded-full h-12 w-12 bg-transparent"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      <Button
        onClick={onToggle}
        className="rounded-full h-14 w-14"
        size="icon"
      >
        {isRunning ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-0.5" />
        )}
      </Button>
    </div>
  )
}
