"use client"

import { useEffect, useRef } from "react"

interface AnalogClockProps {
  date: Date
}

export function AnalogClock({ date }: AnalogClockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    // Set physical size
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    // Scale context for logical coordinates
    ctx.scale(dpr, dpr)

    // Use logical dimensions for drawing
    const width = rect.width
    const height = rect.height
    
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 4

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Styling
    ctx.lineCap = "round"
    ctx.strokeStyle = "currentColor" // Use current text color

    // Draw Markers
    ctx.save()
    ctx.translate(centerX, centerY)
    for (let i = 0; i < 60; i++) {
      const isHour = i % 5 === 0
      const angle = (i * 6 * Math.PI) / 180
      ctx.rotate(angle)
      
      ctx.beginPath()
      if (isHour) {
        ctx.lineWidth = 2
        ctx.strokeStyle = "currentColor"
        ctx.moveTo(0, -radius + 12)
        ctx.lineTo(0, -radius)
      } else {
        ctx.lineWidth = 1
        ctx.strokeStyle = "rgba(128, 128, 128, 0.5)"
        ctx.moveTo(0, -radius + 5)
        ctx.lineTo(0, -radius)
      }
      ctx.stroke()
      ctx.rotate(-angle)
    }
    ctx.restore()

    const seconds = date.getSeconds()
    const minutes = date.getMinutes()
    const hours = date.getHours() % 12
    const milliseconds = date.getMilliseconds()

    const secondAngle = ((seconds + milliseconds / 1000) * 6 * Math.PI) / 180
    const minuteAngle = ((minutes + seconds / 60) * 6 * Math.PI) / 180
    const hourAngle = ((hours + minutes / 60) * 30 * Math.PI) / 180

    // Draw Hour Hand
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(hourAngle)
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, 10)
    ctx.lineTo(0, -radius * 0.5)
    ctx.stroke()
    ctx.restore()

    // Draw Minute Hand
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(minuteAngle)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, 10)
    ctx.lineTo(0, -radius * 0.7)
    ctx.stroke()
    ctx.restore()

    // Draw Second Hand
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(secondAngle)
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, 15)
    ctx.lineTo(0, -radius * 0.85)
    ctx.stroke()
    // Center dot
    ctx.beginPath()
    ctx.arc(0, 0, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

  }, [date])

  return (
    <canvas
      ref={canvasRef}
      className="text-foreground"
      style={{ 
        width: "min(85vw, 75vh)", 
        height: "min(85vw, 75vh)",
        maxWidth: "800px",
        maxHeight: "800px"
      }}
    />
  )
}
