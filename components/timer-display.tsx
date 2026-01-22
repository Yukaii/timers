"use client"

import React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { AnalogClock } from "@/components/analog-clock"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

type Mode = "stopwatch" | "clock" | "countdown" | "alarm"

interface TimerDisplayProps {
  mode: Mode
  countdownSeconds: number
  onCountdownSecondsChange?: (seconds: number) => void
  alarmHour: number
  alarmMinute: number
  onAlarmChange?: (hour: number, minute: number) => void
  isRunning: boolean
  onTimeUp?: () => void
}

function formatTime(ms: number, showMs = false): { hours: string; minutes: string; seconds: string; milliseconds?: string } {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
    milliseconds: showMs ? milliseconds.toString().padStart(2, "0") : undefined,
  }
}

function formatClockTime(date: Date): { hours: string; minutes: string; seconds: string; milliseconds?: string } {
  return {
    hours: date.getHours().toString().padStart(2, "0"),
    minutes: date.getMinutes().toString().padStart(2, "0"),
    seconds: date.getSeconds().toString().padStart(2, "0"),
  }
}

export function TimerDisplay({ 
  mode, 
  countdownSeconds, 
  onCountdownSecondsChange,
  alarmHour, 
  alarmMinute,
  onAlarmChange,
  isRunning, 
  onTimeUp 
}: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(0)
  const [remaining, setRemaining] = useState(countdownSeconds * 1000)
  const [alarmRemaining, setAlarmRemaining] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hasEnded, setHasEnded] = useState(false)
  const [showAnalog, setShowAnalog] = useState(false)
  
  // Editable inputs state
  const [editHours, setEditHours] = useState("00")
  const [editMinutes, setEditMinutes] = useState("05")
  const [editSeconds, setEditSeconds] = useState("00")
  
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const secondsRef = useRef<HTMLInputElement>(null)

  // Calculate time until alarm
  const calculateAlarmRemaining = useCallback(() => {
    const now = new Date()
    const target = new Date()
    target.setHours(alarmHour, alarmMinute, 0, 0)
    
    if (target <= now) {
      target.setDate(target.getDate() + 1)
    }
    
    return target.getTime() - now.getTime()
  }, [alarmHour, alarmMinute])

  // Sync edit inputs
  useEffect(() => {
    if (isRunning) return

    if (mode === "countdown") {
      const time = formatTime(remaining)
      setEditHours(time.hours)
      setEditMinutes(time.minutes)
      setEditSeconds(time.seconds)
    } else if (mode === "alarm") {
      setEditHours(alarmHour.toString().padStart(2, "0"))
      setEditMinutes(alarmMinute.toString().padStart(2, "0"))
      setEditSeconds("00")
    }
  }, [remaining, isRunning, mode, alarmHour, alarmMinute])

  // Reset countdown when seconds change
  useEffect(() => {
    setRemaining(countdownSeconds * 1000)
    setHasEnded(false)
  }, [countdownSeconds])

  // Reset alarm remaining when alarm time changes
  useEffect(() => {
    setAlarmRemaining(calculateAlarmRemaining())
    setHasEnded(false)
  }, [alarmHour, alarmMinute, calculateAlarmRemaining])

  // Reset when mode changes
  useEffect(() => {
    setElapsed(0)
    setRemaining(countdownSeconds * 1000)
    setAlarmRemaining(calculateAlarmRemaining())
    setHasEnded(false)
  }, [mode, countdownSeconds, calculateAlarmRemaining])

  // Clock mode
  useEffect(() => {
    if (mode !== "clock") return
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [mode])

  // Stopwatch mode
  useEffect(() => {
    if (mode !== "stopwatch" || !isRunning) return
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 10)
    }, 10)
    return () => clearInterval(interval)
  }, [mode, isRunning])

  // Countdown mode
  useEffect(() => {
    if (mode !== "countdown" || !isRunning || hasEnded) return
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 10) {
          setHasEnded(true)
          onTimeUp?.()
          return 0
        }
        return prev - 10
      })
    }, 10)
    return () => clearInterval(interval)
  }, [mode, isRunning, hasEnded, onTimeUp])

  // Alarm mode
  useEffect(() => {
    if (mode !== "alarm" || !isRunning || hasEnded) return
    const interval = setInterval(() => {
      const newRemaining = calculateAlarmRemaining()
      if (newRemaining <= 1000) {
        setHasEnded(true)
        setAlarmRemaining(0)
        onTimeUp?.()
      } else {
        setAlarmRemaining(newRemaining)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [mode, isRunning, hasEnded, onTimeUp, calculateAlarmRemaining])

  const reset = useCallback(() => {
    setElapsed(0)
    setRemaining(countdownSeconds * 1000)
    setAlarmRemaining(calculateAlarmRemaining())
    setHasEnded(false)
  }, [countdownSeconds, calculateAlarmRemaining])

  // Expose reset function
  useEffect(() => {
    ;(window as unknown as { resetTimer?: () => void }).resetTimer = reset
    return () => {
      delete (window as unknown as { resetTimer?: () => void }).resetTimer
    }
  }, [reset])

  const handleEditChange = (
    value: string,
    setter: (v: string) => void,
    max: number,
    nextRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    // Only allow numeric input
    const cleaned = value.replace(/[^0-9]/g, "")
    if (cleaned.length <= 2) {
      setter(cleaned)
      // Auto-advance to next field when 2 digits entered
      if (cleaned.length === 2 && nextRef?.current) {
        nextRef.current.focus()
        nextRef.current.select()
      }
    }
  }

  const validateAndUpdate = () => {
    const maxHours = mode === "alarm" ? 23 : 99
    const h = Math.min(maxHours, Math.max(0, Number.parseInt(editHours, 10) || 0))
    const m = Math.min(59, Math.max(0, Number.parseInt(editMinutes, 10) || 0))
    const s = Math.min(59, Math.max(0, Number.parseInt(editSeconds, 10) || 0))
    
    setEditHours(h.toString().padStart(2, "0"))
    setEditMinutes(m.toString().padStart(2, "0"))
    setEditSeconds(s.toString().padStart(2, "0"))
    
    if (mode === "countdown") {
      const totalSeconds = h * 3600 + m * 60 + s
      onCountdownSecondsChange?.(Math.max(1, totalSeconds))
    } else if (mode === "alarm") {
      onAlarmChange?.(h, m)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateAndUpdate()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const getTimeDisplay = () => {
    switch (mode) {
      case "clock":
        return formatClockTime(currentTime)
      case "stopwatch":
        return formatTime(elapsed, true)
      case "countdown":
        return formatTime(remaining)
      case "alarm":
        return formatTime(alarmRemaining)
    }
  }

  const isCountdownBased = mode === "countdown" || mode === "alarm"
  const currentRemaining = mode === "countdown" ? remaining : alarmRemaining
  const isUrgent = isCountdownBased && currentRemaining < 60000 && currentRemaining > 0
  const isEnded = isCountdownBased && hasEnded

  const colorClass = isEnded 
    ? "text-destructive animate-pulse" 
    : isUrgent 
    ? "text-destructive" 
    : "text-foreground"

  const timeStyle = {
    fontSize: "clamp(4rem, 25vw, 20rem)",
    lineHeight: 1,
    fontWeight: 200,
    letterSpacing: "-0.02em",
  }

  const inputStyle = {
    ...timeStyle,
    width: "2ch",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    outline: "none",
    textAlign: "center" as const,
    caretColor: "currentColor",
  }

  const time = getTimeDisplay()
  const showHours = mode === "clock" || mode === "alarm" || Number.parseInt(time.hours) > 0 || (mode === "countdown" && !isRunning)
  const isEditable = (mode === "countdown" || mode === "alarm") && !isRunning
  const showSecondsInput = mode === "countdown"

  if (mode === "clock" && showAnalog) {
    return (
      <div className="flex flex-col items-center gap-4 relative">
        <div 
          onClick={() => setShowAnalog(false)} 
          className="cursor-pointer hover:scale-105 transition-transform"
          title="Click to switch to digital clock"
        >
          <AnalogClock date={currentTime} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`font-sans font-light tracking-tight transition-colors duration-300 flex items-baseline ${colorClass} ${
        mode === "clock" ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={timeStyle}
      onClick={() => mode === "clock" && setShowAnalog(true)}
      title={mode === "clock" ? "Click to switch to analog clock" : undefined}
    >
      {isEditable ? (
        <>
          <input
            ref={hoursRef}
            type="text"
            inputMode="numeric"
            value={editHours}
            onChange={(e) => handleEditChange(e.target.value, setEditHours, mode === "alarm" ? 23 : 99, minutesRef)}
            onBlur={validateAndUpdate}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            className="hover:border-muted-foreground/30 focus:border-foreground transition-colors"
            style={inputStyle}
          />
          <span>:</span>
          <input
            ref={minutesRef}
            type="text"
            inputMode="numeric"
            value={editMinutes}
            onChange={(e) => handleEditChange(e.target.value, setEditMinutes, 59, showSecondsInput ? secondsRef : undefined)}
            onBlur={validateAndUpdate}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            className="hover:border-muted-foreground/30 focus:border-foreground transition-colors"
            style={inputStyle}
          />
          {showSecondsInput && (
            <>
              <span>:</span>
              <input
                ref={secondsRef}
                type="text"
                inputMode="numeric"
                value={editSeconds}
                onChange={(e) => handleEditChange(e.target.value, setEditSeconds, 59, undefined)}
                onBlur={validateAndUpdate}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                className="hover:border-muted-foreground/30 focus:border-foreground transition-colors"
                style={inputStyle}
              />
            </>
          )}
        </>
      ) : (
        <>
          {showHours && (
            <>
              <span>{time.hours}</span>
              <span>:</span>
            </>
          )}
          <span>{time.minutes}</span>
          <span>:</span>
          <span>{time.seconds}</span>
          {time.milliseconds && (
            <>
              <span className="text-muted-foreground" style={{ fontSize: "0.4em" }}>.{time.milliseconds}</span>
            </>
          )}
        </>
      )}
    </div>
  )
}
