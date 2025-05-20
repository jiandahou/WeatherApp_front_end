
'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { indexOnPageContext } from './context'

function TempertureToColor(temp: number): string {
  if (temp < 0) return "rgb(139, 164, 241)"
  if (temp <= 2) return "rgb(143, 200, 255)"
  if (temp <= 4) return "rgb(138, 227, 245)"
  if (temp <= 7) return "rgb(131, 239, 212)"
  if (temp <= 12) return "rgb(166, 255, 192)"
  if (temp <= 15) return "rgb(194, 255, 161)"
  if (temp <= 18) return "rgb(166, 255, 192)"
  if (temp <= 21) return "rgb(194, 255, 161)"
  if (temp <= 23) return "rgb(255, 219, 140)"
  if (temp <= 28) return "rgb(255, 200, 148)"
  if (temp <= 31) return "rgb(255, 143, 123)"
  if (temp <= 37) return "rgb(255, 123, 119)"
  return "rgb(232, 103, 127)"
}

export function WeatherSVGMotion({
  hourlyinfo,
}: {
  hourlyinfo: hourlyForecast[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const height = 300
  const padding = 60
  const xOffset = 20
  const baselineY = height - 30
  const indexOnpage = useContext(indexOnPageContext)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      const w = containerRef.current!.getBoundingClientRect().width
      setWidth(w)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const now = new Date()
  const isNow = (t: Date) =>
    t.getHours() === now.getHours() && t.getDate() === now.getDate()

  const slice = hourlyinfo.slice(indexOnpage * 24, (indexOnpage + 1) * 24)
  if (slice.length < 2) return null

  const temps = slice.map((h) => h.temperature2m)
  const minT = Math.min(...temps)
  const maxT = Math.max(...temps)
  const range = maxT - minT || 1
  const stepX = width / (slice.length - 1)
  const usableHeight = height - padding * 2

  const points = slice.map((h, i) => {
    const x = i * stepX
    const y = padding + (1 - (h.temperature2m - minT) / range) * usableHeight
    return {
      x,
      y,
      temp: h.temperature2m,
      hour: h.time.getHours(),
      rain: h.precipitationProbability,
      time: h.time,
    }
  })

  const d = (() => {
    let path = `M ${points[0].x + xOffset},${points[0].y} `
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2 + xOffset
      const yc = (points[i].y + points[i + 1].y) / 2
      path += `Q ${points[i].x + xOffset},${points[i].y} ${xc},${yc} `
    }
    path += `T ${points[points.length - 1].x + xOffset},${points[points.length - 1].y}`
    return path
  })()

  const nowIndex = points.findIndex(p => isNow(p.time))

  return (
    <div
      ref={containerRef}
      className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg overflow-hidden p-2"
    >
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {points.map((p, i) => (
              <stop
                key={i}
                offset={`${(p.x / width) * 100}%`}
                stopColor={TempertureToColor(p.temp)}
              />
            ))}
          </linearGradient>
        </defs>

        {/* Fill */}
        <motion.path
          key={`fill-${indexOnpage}`}
          d={`${d} L ${width + xOffset} ${baselineY} L ${xOffset} ${baselineY} Z`}
          fill="url(#curveGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        />

        {/* Line */}
        <motion.path
          key={`line-${indexOnpage}`}
          d={d}
          stroke="url(#curveGradient)"
          strokeWidth={3}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4 }}
        />

        {/* Highlight vertical line at current hour */}
        {nowIndex !== -1 && (
          <line
            x1={points[nowIndex].x + xOffset}
            y1={padding}
            x2={points[nowIndex].x + xOffset}
            y2={baselineY}
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="4"
          />
        )}

        {/* Data points */}
        {points.map((p, i) =>
          i % 2 === 0 ? (
            <g key={i}>
              <text
                x={p.x + xOffset}
                y={p.y - 10}
                fontSize={12}
                textAnchor="middle"
                fill="#1e293b"
              >
                {p.temp.toFixed(1)}°
              </text>
              <image
                x={p.x + xOffset - 8}
                y={height - 50}
                width={16}
                height={16}
                href="/Raininpanel.svg"
              />
              <text
                x={p.x + xOffset}
                y={height - 60}
                fontSize={10}
                textAnchor="middle"
                fill="#3b82f6"
              >
                {p.rain}%
              </text>
              <text
                x={p.x + xOffset + 2}
                y={height - 10}
                fontSize={11}
                textAnchor="middle"
                fill="#4b5563"
              >
                {isNow(p.time) ? 'Now' : `${p.hour}:00`}
              </text>
              {/* Animated rain drop if rain > 60% */}
              {p.rain >= 60 && (
                <motion.circle
                  cx={p.x + xOffset}
                  cy={height - 50}
                  r={2}
                  fill="#60a5fa"
                  initial={{ cy: height - 60, opacity: 0.8 }}
                  animate={{ cy: height - 40, opacity: 0 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeIn" }}
                />
              )}
            </g>
          ) : null
        )}

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
