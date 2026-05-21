import Image from 'next/image'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

 function Windcompass({
     windspeed,
     windDirection,
 }: {
     windspeed: number;
     windDirection: number;
 }) {
    const shouldReduceMotion = useReducedMotion()
    const panelRef = useRef<HTMLDivElement>(null)
    const hasEnteredView = useInView(panelRef, { once: true, margin: '-10% 0px' })

    const normalizeDegree = (value: number) => {
        const normalized = value % 360
        return normalized < 0 ? normalized + 360 : normalized
    }

    const windDirectionInterpreter = (number: number): string => {
        const direction = normalizeDegree(number)
        const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
        const index = Math.round(direction / 22.5) % 16
        return sectors[index]
    }

    const targetDirection = useMemo(() => normalizeDegree(windDirection), [windDirection])
    const [displayDirection, setDisplayDirection] = useState(targetDirection)

    useEffect(() => {
        setDisplayDirection((previous) => {
            const delta = ((targetDirection - previous + 540) % 360) - 180
            return previous + delta
        })
    }, [targetDirection])

    const beaufortLevel = useMemo(() => {
        if (windspeed < 1) return 'Calm'
        if (windspeed < 6) return 'Light'
        if (windspeed < 12) return 'Breeze'
        if (windspeed < 20) return 'Moderate'
        if (windspeed < 29) return 'Fresh'
        if (windspeed < 39) return 'Strong'
        return 'Gale'
    }, [windspeed])


  return (
        <div ref={panelRef} className='weather-metric-card col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
                <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
            <Image src="/Windspeed.png" alt='windspeed' width={22} height={22} loading="eager" />
            <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Wind Control</span>
                    </div>
                    <span className='rounded-full border border-ui-stroke-soft/35 bg-ui-surface-1/70 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-ui-text-3'>
                        {beaufortLevel}
                    </span>
        </div>

                <div className='mt-3 flex items-end gap-2'>
            <span className='text-6xl font-semibold leading-none'>{Math.round(windspeed)}</span>
            <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>km/h</span>
        </div>

                <div className='mt-1 flex items-center justify-between text-sm text-ui-text-2'>
                    <span>Direction {windDirectionInterpreter(targetDirection)}</span>
                    <span>{Math.round(targetDirection)}°</span>
                </div>

                <div className='relative mt-4 mx-auto h-36 w-36'>
                        <svg viewBox='0 0 160 160' className='h-full w-full'>
                            <defs>
                                <radialGradient id='windDialGradient' cx='50%' cy='40%' r='65%'>
                                    <stop offset='0%' stopColor='rgba(148, 163, 184, 0.22)' />
                                    <stop offset='100%' stopColor='rgba(15, 23, 42, 0.35)' />
                                </radialGradient>
                            </defs>

                            <circle cx='80' cy='80' r='70' fill='url(#windDialGradient)' stroke='rgba(148, 163, 184, 0.24)' strokeWidth='1.5' />
                            <circle cx='80' cy='80' r='55' fill='none' stroke='rgba(148, 163, 184, 0.2)' strokeWidth='1' />

                            {Array.from({ length: 24 }).map((_, i) => {
                                if (i % 6 === 0) return null

                                const angle = (i * 360) / 24
                                const rad = (angle - 90) * Math.PI / 180
                                const outerR = 64
                                const innerR = 61
                                const x1 = 80 + Math.cos(rad) * innerR
                                const y1 = 80 + Math.sin(rad) * innerR
                                const x2 = 80 + Math.cos(rad) * outerR
                                const y2 = 80 + Math.sin(rad) * outerR

                                return (
                                    <line
                                        key={i}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke='rgba(148, 163, 184, 0.5)'
                                        strokeWidth={1}
                                        strokeLinecap='round'
                                    />
                                )
                            })}

                            <text x='80' y='20' textAnchor='middle' className='fill-ui-text-1 text-[13px] font-semibold'>N</text>
                            <text x='140' y='84' textAnchor='middle' className='fill-ui-text-2 text-[11px]'>E</text>
                            <text x='80' y='149' textAnchor='middle' className='fill-ui-text-2 text-[11px]'>S</text>
                            <text x='20' y='84' textAnchor='middle' className='fill-ui-text-2 text-[11px]'>W</text>
                        </svg>

                        <motion.div
                            className='absolute inset-0'
                            animate={{ rotate: hasEnteredView ? displayDirection : 0 }}
                            initial={{ rotate: 0 }}
                            transition={
                                shouldReduceMotion || !hasEnteredView
                                    ? { duration: 0 }
                                    : { type: 'spring', stiffness: 120, damping: 18, mass: 0.6 }
                            }
                            style={{ transformOrigin: '50% 50%' }}
                        >
                            <svg viewBox='0 0 160 160' className='h-full w-full'>
                                <line x1='80' y1='80' x2='80' y2='35' stroke='rgba(248, 250, 252, 0.9)' strokeWidth='2.2' strokeLinecap='round' />
                                <polygon points='80,24 75,37 85,37' fill='rgba(244, 63, 94, 0.95)' />
                                <polygon points='80,136 76.5,126 83.5,126' fill='rgba(148, 163, 184, 0.65)' />
                            </svg>
                        </motion.div>

                        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                            <div className='h-4 w-4 rounded-full border border-white/40 bg-slate-100/95 shadow-[0_0_10px_rgba(255,255,255,0.3)]' />
                        </div>

                        <div className='pointer-events-none absolute inset-x-0 bottom-4 flex justify-center'>
                            <span className='rounded-md border border-ui-stroke-soft/35 bg-ui-surface-2/80 px-2 py-0.5 text-[10px] tracking-[0.18em] text-ui-text-2'>
                                {windDirectionInterpreter(targetDirection)}
                            </span>
                        </div>
        </div>
    </div>
  )
}

export default Windcompass
