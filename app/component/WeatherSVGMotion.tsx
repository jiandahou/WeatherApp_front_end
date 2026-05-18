'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { indexOnPageContext } from './context'
import { type hourlyForecast } from '../type/weatherType'
import { Clock3, CloudOff } from 'lucide-react'

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
  timezone,
  timezoneAbbreviation,
}: {
  hourlyinfo: hourlyForecast[]
  timezone?: string
  timezoneAbbreviation?: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const height = 300
  const padding = 60
  const xOffset = 20
  const xRightOffset = width < 640 ? 34 : 24
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
  const timezoneLabel = timezoneAbbreviation && timezone
    ? `${timezoneAbbreviation} / ${timezone}`
    : timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: timezone,
  })
  const dayHourFormatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    timeZone: timezone,
  })
  const getHourInForecastTimezone = (date: Date) => {
    const hour = Number(hourFormatter.format(date))
    return hour === 24 ? 0 : hour
  }
  
  // 修复：安全的日期比较函数
  const isNow = (timeValue: any) => {
    const t = timeValue instanceof Date ? timeValue : new Date(timeValue)
    return dayHourFormatter.format(t) === dayHourFormatter.format(now)
  }

  // 修复：安全的日期转换函数
  const getDateObject = (timeValue: any): Date => {
    if (!timeValue) return new Date()
    if (timeValue instanceof Date) return timeValue
    return new Date(timeValue)
  }

  const nowHour = getHourInForecastTimezone(now);
  const startIndex = indexOnpage === 0 ? nowHour : 0 // First day starts from current hour, others from 0:00
  const absoluteStart = indexOnpage * 24 + startIndex
  const slice = hourlyinfo.slice(absoluteStart, absoluteStart + 25)
  if (slice.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-ui-stroke-soft/25 bg-ui-surface-1/55 p-6 text-center text-ui-text-2">
        <CloudOff className="mx-auto h-8 w-8 text-ui-text-3" aria-hidden />
        <div className="mt-3 text-sm font-semibold text-ui-text-1">Hourly outlook is unavailable</div>
        <div className="mt-1 text-xs text-ui-text-3">The latest weather update did not include enough hourly rows.</div>
      </div>
    )
  }

  const temps = slice.map((h) => h.temperature2m)
  const minT = Math.min(...temps)
  const maxT = Math.max(...temps)
  const range = maxT - minT || 1
  const plotWidth = Math.max(1, width - xOffset - xRightOffset)
  const stepX = plotWidth / (slice.length - 1)
  const usableHeight = height - padding * 2

  const points = slice.map((h, i) => {
    const timeObj = getDateObject(h.time)
    const x = i * stepX
    const y = padding + (1 - (h.temperature2m - minT) / range) * usableHeight
    return {
      x,
      y,
      temp: h.temperature2m,
      hour: getHourInForecastTimezone(timeObj),
      rain: h.precipitationProbability,
      time: timeObj,
    }
  })

  const firstPointTime = points[0]?.time;
  const firstPointIso = firstPointTime instanceof Date
    ? firstPointTime.toISOString()
    : new Date(firstPointTime).toISOString();
  const animationKey = `${indexOnpage}-${firstPointIso}`;
  const isCompact = width < 640
  const isVeryCompact = width < 460
  const labelStep = isVeryCompact ? 4 : isCompact ? 3 : 2
  const tempLabelLift = isVeryCompact ? 32 : 40
  const tempFontSize = isVeryCompact ? 10 : 12
  const rainFontSize = isVeryCompact ? 9 : 10
  const timeFontSize = isVeryCompact ? 10 : 11
  const rainIconSize = isVeryCompact ? 13 : 16

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

  // 修复：使用安全的时间比较
  const nowIndex = points.findIndex(p => isNow(p.time))
  const formatHourLabel = (p: { hour: number; time: Date }, i: number) => {
    if (isNow(p.time)) return 'Now'
    const isLastPoint = i === points.length - 1
    if (isLastPoint && points.length > 24 && p.hour === 0) return '24:00'
    return `${p.hour.toString().padStart(2, '0')}:00`
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-xl border border-ui-stroke-soft/20 bg-ui-surface-1/70 p-2 shadow-panelSoft backdrop-blur-md"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2 pt-2 text-xs text-ui-text-3">
        <div className="inline-flex items-center gap-2 font-medium text-ui-text-2">
          <Clock3 className="h-4 w-4 text-ui-accent" aria-hidden />
          <span>Hourly outlook</span>
        </div>
        <span>{timezoneLabel}</span>
      </div>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {points.map((p, i) => (
              <stop
                key={i}
                offset={`${(p.x / plotWidth) * 100}%`}
                stopColor={TempertureToColor(p.temp)}
              />
            ))}
          </linearGradient>
        </defs>

        {/* Fill */}
        <motion.path
          key={`fill-${animationKey}`}
          d={`${d} L ${plotWidth + xOffset} ${baselineY} L ${xOffset} ${baselineY} Z`}
          fill="url(#curveGradient)"
          initial={{ opacity: shouldReduceMotion ? 0.3 : 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
        />

        {/* Line */}
        <motion.path
          key={`line-${animationKey}`}
          d={d}
          stroke="url(#curveGradient)"
          strokeWidth={3}
          fill="none"
          initial={{ pathLength: shouldReduceMotion ? 1 : 0, opacity: shouldReduceMotion ? 1 : 0.7 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: 'easeOut' }}
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
        {points.map((p, i) => {
          const shouldShow = i % labelStep === 0 || i === points.length - 1 || isNow(p.time)
          if (!shouldShow) return null
          const pointX = p.x + xOffset
          const edgePadding = isVeryCompact ? 16 : 20
          const labelX = Math.min(width - edgePadding, Math.max(edgePadding, pointX))

          return (
            <g key={i}>
              <text
                x={labelX}
                y={Math.max(18, p.y - tempLabelLift)}
                fontSize={tempFontSize}
                textAnchor="middle"
                fill="#ffffff"
              >
                {p.temp.toFixed(1)}°
              </text>
              <image
                x={labelX - rainIconSize / 2}
                y={height - 50}
                width={rainIconSize}
                height={rainIconSize}
                href="/RaininPanel.svg"
              />
              <text
                x={labelX}
                y={height - 60}
                fontSize={rainFontSize}
                textAnchor="middle"
                fill="#3b82f6"
              >
                {p.rain}%
              </text>
              <text
                x={labelX + 2}
                y={height - 10}
                fontSize={timeFontSize}
                textAnchor="middle"
                fill="#ffffff"
              >
                {formatHourLabel(p, i)}
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
          )
        })}

        <line
          x1={xOffset} // Ensure alignment with the curve's starting point
          y1={baselineY}
          x2={points[points.length - 1].x + xOffset} // Align with the curve's end point
          y2={baselineY}
          stroke="rgba(155, 75, 155, 0.8)"
          strokeWidth={1}
        />
      </svg>
    </div>
  )
}
