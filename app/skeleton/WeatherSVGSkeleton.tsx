'use client'

import React, { useRef, useState, useEffect } from 'react'

export function WeatherSVGSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const height = 300
  const padding = 60
  const xOffset = 20
  const baselineY = height - 30

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      const w = containerRef.current!.getBoundingClientRect().width
      setWidth(w)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const numPoints = 12
  const stepX = width / (numPoints - 1)
  const points = Array.from({ length: numPoints }, (_, i) => ({
    x: i * stepX,
    y: padding + (Math.sin(i / 2) * 30 + 80)
  }))

  return (
    <div
      ref={containerRef}
      className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg overflow-hidden p-2 animate-pulse"
    >
      <svg width={width} height={height}>
        <path
          d={`M ${points[0].x + xOffset},${points[0].y} ${points
            .slice(1)
            .map(p => `L ${p.x + xOffset},${p.y}`)
            .join(' ')}`}
          stroke="rgba(200,200,200,0.5)"
          strokeWidth={3}
          fill="none"
        />

        {points.map((p, i) => (
          <rect
            key={`temp-${i}`}
            x={p.x + xOffset - 12}
            y={p.y - 18}
            width={24}
            height={10}
            fill="rgba(200,200,200,0.5)"
            rx={4}
          />
        ))}

        {points.map((p, i) => (
          <circle
            key={`rain-${i}`}
            cx={p.x + xOffset}
            cy={height - 50}
            r={8}
            fill="rgba(200,200,200,0.5)"
          />
        ))}

        {points.map((p, i) => (
          <rect
            key={`rainText-${i}`}
            x={p.x + xOffset - 10}
            y={height - 60}
            width={20}
            height={8}
            fill="rgba(200,200,200,0.5)"
            rx={3}
          />
        ))}

        {points.map((p, i) => (
          <rect
            key={`time-${i}`}
            x={p.x + xOffset - 12}
            y={height - 10}
            width={24}
            height={8}
            fill="rgba(200,200,200,0.5)"
            rx={3}
          />
        ))}
        <line
          x1={0}
          y1={baselineY}
          x2={width + xOffset}
          y2={baselineY}
          stroke="rgba(155, 75, 155, 0.8)"
          strokeWidth={1}
        />
      </svg>
    </div>
  )
}
