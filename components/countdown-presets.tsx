"use client"

interface CountdownPresetsProps {
  onSelect: (minutes: number) => void
}

const presets = [1, 5, 10, 15, 25, 30, 45, 60]

export function CountdownPresets({ onSelect }: CountdownPresetsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => onSelect(preset)}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
        >
          {preset}m
        </button>
      ))}
    </div>
  )
}
