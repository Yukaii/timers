"use client"

import { useState, useCallback, useEffect } from "react"
import { TimerDisplay } from "@/components/timer-display"
import { ModeSelector } from "@/components/mode-selector"
import { CountdownPresets } from "@/components/countdown-presets"
import { AlarmSetter } from "@/components/alarm-setter"
import { TimerControls } from "@/components/timer-controls"
import { Confetti } from "@/components/confetti"
import { ThemeToggle } from "@/components/theme-toggle"

type Mode = "stopwatch" | "clock" | "countdown" | "alarm"

export default function PresentationTimer() {
  const [mode, setMode] = useState<Mode>("clock")
  const [isRunning, setIsRunning] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(5 * 60) // 5 minutes default
  const [alarmHour, setAlarmHour] = useState(() => {
    const now = new Date()
    return (now.getHours() + 1) % 24
  })
  const [alarmMinute, setAlarmMinute] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setIsRunning(false)
    setShowConfetti(false)
  }

  const handleToggle = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setShowConfetti(false)
    ;(window as unknown as { resetTimer?: () => void }).resetTimer?.()
  }, [])

  const handleTimeUp = useCallback(() => {
    setIsRunning(false)
    setShowConfetti(true)
  }, [])

  const showControls = mode === "stopwatch" || mode === "countdown" || mode === "alarm"

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement) return
      
      if (e.code === "Space" && showControls) {
        e.preventDefault()
        handleToggle()
      }
      if (e.code === "KeyR" && showControls) {
        e.preventDefault()
        handleReset()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showControls, handleReset])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <Confetti show={showConfetti} />
      
      {/* Mode Selector */}
      <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2">
        <ModeSelector mode={mode} onChange={handleModeChange} />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8">
        <ThemeToggle />
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center flex-1 gap-8">
        <TimerDisplay
          mode={mode}
          countdownSeconds={countdownSeconds}
          onCountdownSecondsChange={setCountdownSeconds}
          alarmHour={alarmHour}
          alarmMinute={alarmMinute}
          isRunning={isRunning}
          onTimeUp={handleTimeUp}
        />

        {/* Countdown Presets */}
        {mode === "countdown" && !isRunning && (
          <CountdownPresets
            onSelect={(minutes) => setCountdownSeconds(minutes * 60)}
          />
        )}

        {/* Alarm Setter */}
        {mode === "alarm" && (
          <AlarmSetter
            hour={alarmHour}
            minute={alarmMinute}
            onHourChange={setAlarmHour}
            onMinuteChange={setAlarmMinute}
            disabled={isRunning}
          />
        )}

        {/* Controls */}
        {showControls && (
          <TimerControls
            isRunning={isRunning}
            onToggle={handleToggle}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      {showControls && (
        <div className="absolute bottom-4 sm:bottom-8 text-xs text-muted-foreground flex gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Space</kbd> start/stop
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">R</kbd> reset
          </span>
        </div>
      )}
    </main>
  )
}
