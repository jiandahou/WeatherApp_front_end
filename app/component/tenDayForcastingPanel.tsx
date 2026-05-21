import type { weatherdailyinfo, hourlyForecast } from '../type/weatherType';
/* eslint-disable react/jsx-key */
"use client"
import clsx from "clsx"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { resolveWeatherIconFallbackSrc, resolveWeatherIconSrcByCode, resolveWeatherKeyByCode } from "../weatherCode/weatherVisualTokens"
import { indexOnPageContext } from "./context"
import { motion } from "motion/react"
import { WeatherSVGMotion } from "./WeatherSVGMotion"
import Image from 'next/image'
import { CalendarDays, CloudOff } from "lucide-react"

const monthIntepretor:{[key:number]:string}={
    0:"January",
    1:"February",
    2:"March",
    3:"April",
    4:"May",
    5:"June",
    6:"July",
    7:"August",
    8:"September",
    9:"October",
    10:"November",
    11:"December",
}

function formatDatePart(date: Date, timezone?: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: timezone,
    }).format(date)
}

function getRelativeDayLabel(date: Date, timezone?: string): string {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (formatDatePart(date, timezone) === formatDatePart(today, timezone)) return "Today"
    if (formatDatePart(date, timezone) === formatDatePart(tomorrow, timezone)) return "Tomorrow"
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone })
}

export function Buttonforoneday({weatherForThatDay,isActive=false,onClick=()=>{return},timezone}:{
    weatherForThatDay:weatherdailyinfo,isActive?:boolean,onClick?:any,timezone?: string}
){
    let weathername=resolveWeatherKeyByCode(weatherForThatDay.weathercode)
    const weatherIconSrc = resolveWeatherIconSrcByCode(weatherForThatDay.weathercode)
    const weatherIconFallbackSrc = resolveWeatherIconFallbackSrc()
    
    // 确保 time 是 Date 对象
    const dateObj = weatherForThatDay.time instanceof Date 
        ? weatherForThatDay.time 
        : new Date(weatherForThatDay.time);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', timeZone: timezone });
    const dayNumberLabel = dateObj.toLocaleDateString('en-US', { day: 'numeric', timeZone: timezone });
    const weekdayLongLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });
    const relativeDayLabel = getRelativeDayLabel(dateObj, timezone);
    const dayLabel = `${monthLabel} ${dayNumberLabel} ${weekdayLongLabel}`;
    
    return(
        <motion.div layout transition={{ type: "spring", stiffness: 220, damping: 24 }} className={clsx("shrink-0 grow-0",{"basis-40 sm:basis-44":isActive==false,"basis-64 sm:basis-80":isActive==true})}>
            <motion.button
                layout
                type="button"
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Active' : 'Switch to'} forecast day ${dayLabel}. High ${weatherForThatDay.highestTemperature.toFixed(1)} degrees, low ${weatherForThatDay.lowestTemperature.toFixed(1)} degrees, rain ${weatherForThatDay.precipitationProbabilityMax} percent.`}
                className={clsx(
                    "button h-28 sm:h-32 w-full rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 text-left text-ui-text-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70",
                    {
                        "panel-surface border-ui-stroke-soft/20":isActive==false,
                        "panel-surface-strong border-ui-accent/40 shadow-panelGlow":isActive==true,
                    }
                )}
                onClick={(e)=>onClick()}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ui-accent sm:text-xs">{relativeDayLabel}</div>
                        <div className="mt-1 text-[1.35rem] leading-tight font-semibold sm:text-sm">{monthLabel} {dayNumberLabel}</div>
                        <div className="text-[11px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.2em] text-ui-text-3">{weekdayLongLabel}</div>
                    </div>
                    <Image alt={weathername} src={weatherIconSrc} width={38} height={38} className="h-8 w-8 sm:h-[38px] sm:w-[38px]" onError={(e) => { (e.target as HTMLImageElement).src = weatherIconFallbackSrc; }} />
                </div>

                <div className="mt-2.5 sm:mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div className="rounded-xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 px-1.5 sm:px-2 py-1">
                        <div className="text-[9px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.2em] text-ui-text-3">High</div>
                        <div className={clsx("font-semibold leading-tight tabular-nums whitespace-nowrap", {"text-[12px] sm:text-[13px]":!isActive, "text-[14px] sm:text-[15px]":isActive})}>{weatherForThatDay.highestTemperature.toFixed(1)}°</div>
                    </div>
                    <div className="rounded-xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 px-1.5 sm:px-2 py-1">
                        <div className="text-[9px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.2em] text-ui-text-3">Low</div>
                        <div className={clsx("font-semibold leading-tight tabular-nums whitespace-nowrap", {"text-[12px] sm:text-[13px]":!isActive, "text-[14px] sm:text-[15px]":isActive})}>{weatherForThatDay.lowestTemperature.toFixed(1)}°</div>
                    </div>
                    <div className="rounded-xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 px-1.5 sm:px-2 py-1">
                        <div className="text-[9px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.2em] text-ui-text-3">Rain</div>
                        <div className={clsx("font-semibold leading-tight tabular-nums whitespace-nowrap text-ui-accent", {"text-[12px] sm:text-[13px]":!isActive, "text-[14px] sm:text-[15px]":isActive})}>{weatherForThatDay.precipitationProbabilityMax}%</div>
                    </div>
                </div>

                {isActive&&<div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-medium text-ui-text-2 truncate max-w-full text-ellipsis text-center" style={{overflow:'hidden'}} title={weathername}>{weathername}</div>}
            </motion.button>
        </motion.div>
    )
}
export function ButtonPanleForTenDay({
    onClick,
    weatherForNextTenDay,
    timezone,
}:{
    onClick: Function;
    weatherForNextTenDay: weatherdailyinfo[];
    timezone?: string;
}){
    const activeOnpage=useContext(indexOnPageContext)
    const viewportRef=useRef<HTMLDivElement>(null)
    const trackRef=useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const getButtons = useCallback(() => {
        return Array.from(trackRef.current?.getElementsByClassName("button") ?? []) as HTMLElement[]
    }, [])

    const getCurrentIndex = useCallback(() => {
        const viewport = viewportRef.current
        const buttons = getButtons()
        if (!viewport || !buttons.length) return 0

        const viewportLeft = viewport.getBoundingClientRect().left
        let currentIndex = 0
        let minDistance = Number.POSITIVE_INFINITY

        buttons.forEach((button: HTMLElement, index: number) => {
            const distance = Math.abs(button.getBoundingClientRect().left - viewportLeft)
            if (distance < minDistance) {
                minDistance = distance
                currentIndex = index
            }
        })

        return currentIndex
    }, [getButtons])

    const getVisibleCount = useCallback(() => {
        const viewport = viewportRef.current
        const buttons = getButtons()
        if (!viewport || !buttons.length) return 1
        const cardWidth = buttons[0].getBoundingClientRect().width || 1
        return Math.max(1, Math.floor(viewport.clientWidth / cardWidth))
    }, [getButtons])

    const updateArrowState = useCallback(() => {
        const viewport = viewportRef.current
        if (!viewport) return
        const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth
        setCanScrollLeft(viewport.scrollLeft > 2)
        setCanScrollRight(viewport.scrollLeft < maxScrollLeft - 2)
    }, [])

    useEffect(() => {
        updateArrowState()
        const viewport = viewportRef.current
        const track = trackRef.current
        if (!viewport) return

        const onScroll = () => updateArrowState()
        viewport.addEventListener("scroll", onScroll, { passive: true })

        const roViewport = new ResizeObserver(() => {
            updateArrowState()
            const buttons = getButtons()
            if (buttons[activeOnpage]) {
                const isMobile = window.innerWidth < 640
                buttons[activeOnpage].scrollIntoView({ inline: isMobile ? "center" : "nearest", block: "nearest" })
            }
        })

        const roTrack = new ResizeObserver(() => {
            updateArrowState()
        })

        roViewport.observe(viewport)
        if (track) roTrack.observe(track)

        // Run post-layout checks so first paint and image/layout hydration are covered.
        const raf1 = window.requestAnimationFrame(updateArrowState)
        const raf2 = window.requestAnimationFrame(() => window.requestAnimationFrame(updateArrowState))

        return () => {
            viewport.removeEventListener("scroll", onScroll)
            roViewport.disconnect()
            roTrack.disconnect()
            window.cancelAnimationFrame(raf1)
            window.cancelAnimationFrame(raf2)
        }
    }, [activeOnpage, getButtons, updateArrowState])

    useEffect(() => {
        const buttons = getButtons()
        if (!buttons[activeOnpage]) return
        // Use "center" for small screens to ensure expanded card is fully visible
        // Use "nearest" for large screens to avoid unnecessary scrolling
        const isMobile = window.innerWidth < 640
        buttons[activeOnpage].scrollIntoView({ 
            inline: isMobile ? "center" : "nearest", 
            block: "nearest", 
            behavior: "smooth" 
        })
        updateArrowState()
    }, [activeOnpage, getButtons, updateArrowState])

    function turnleft(){
        const buttons = getButtons()
        if (!buttons.length) return
        const currentIndex = getCurrentIndex()
        const visibleCount = getVisibleCount()
        const targetIndex = Math.max(currentIndex - Math.max(1, visibleCount - 1), 0)
        if (targetIndex === currentIndex) return
        buttons[targetIndex].scrollIntoView({ inline:"start", block:"nearest", behavior:"smooth" })
    }

    function turnright(){
        const buttons = getButtons()
        if (!buttons.length) return
        const currentIndex = getCurrentIndex()
        const visibleCount = getVisibleCount()
        const targetIndex = Math.min(currentIndex + Math.max(1, visibleCount - 1), buttons.length - 1)
        if (targetIndex === currentIndex) return
        buttons[targetIndex].scrollIntoView({ inline:"start", block:"nearest", behavior:"smooth" })
    }

    return(
        <div className="relative my-5">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] sm:tracking-[0.3em] text-ui-text-3">10-Day Forecast</h3>
                    <p className="text-[11px] sm:text-xs text-ui-text-2">High, low, and rain probability by day.</p>
                </div>
                <div className="panel-surface rounded-full border border-ui-stroke-soft/15 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs text-ui-text-2">Day {activeOnpage + 1}</div>
            </div>
            <div className="relative">
            <button type="button" disabled={!canScrollLeft} aria-label="Scroll forecast left" title="turnleft" className={clsx("absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 sm:p-2 text-ui-text-1 transition panel-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70", {"hover:scale-110": canScrollLeft, "opacity-45": !canScrollLeft, "cursor-not-allowed": !canScrollLeft})} onClick={(e)=>{turnleft()}}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 rotate-180 fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.57107 11.8403C6.90803 12.2987 6 11.8271 6 11.0244V4.97557C6 4.17283 6.90803 3.70129 7.57106 4.1597L11.3555 6.77618C12.2133 7.3693 12.2134 8.63066 11.3555 9.22378L7.57107 11.8403Z" fill="currentColor"></path></svg>
            </button>
            <div ref={viewportRef} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-8 sm:px-0">
            <div ref={trackRef} className="flex w-max">
                {weatherForNextTenDay.map((wentherForThatDay,index)=>(
                    <Buttonforoneday weatherForThatDay={wentherForThatDay} isActive={index==activeOnpage} onClick={()=>{onClick(index)}} timezone={timezone} key={`${wentherForThatDay.time}-${index}`} />
                ))}
            </div>
            </div>
            <button type="button" disabled={!canScrollRight} aria-label="Scroll forecast right" title="turnright" className={clsx("absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 sm:p-2 text-ui-text-1 transition panel-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70", {"hover:scale-110": canScrollRight, "opacity-45": !canScrollRight, "cursor-not-allowed": !canScrollRight})} onClick={(e)=>{turnright()}}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.57107 11.8403C6.90803 12.2987 6 11.8271 6 11.0244V4.97557C6 4.17283 6.90803 3.70129 7.57106 4.1597L11.3555 6.77618C12.2133 7.3693 12.2134 8.63066 11.3555 9.22378L7.57107 11.8403Z" fill="currentColor"></path></svg>
            </button>
            </div>
        </div>
    )
}
export default function TenDayForcastingPanel({
    hourlyinfo,
    weatherForNextTenDay,
    timezone,
    timezoneAbbreviation,
}:{
    hourlyinfo: hourlyForecast[];
    weatherForNextTenDay: weatherdailyinfo[];
    timezone?: string;
    timezoneAbbreviation?: string;
}) {
    var [index,setIndex]=useState(0)
    useEffect(() => {
        if (index >= weatherForNextTenDay.length) {
            setIndex(0)
        }
    }, [index, weatherForNextTenDay.length])

    const selectedDay = weatherForNextTenDay[index]
    const selectedDate = selectedDay?.time instanceof Date ? selectedDay.time : selectedDay?.time ? new Date(selectedDay.time) : null
    const selectedDayLabel = selectedDate
        ? `${getRelativeDayLabel(selectedDate, timezone)} / ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone })}`
        : "No day selected"

    if (!weatherForNextTenDay.length) {
        return (
            <div className="rounded-2xl border border-dashed border-ui-stroke-soft/25 bg-ui-surface-1/55 p-6 text-center text-ui-text-2">
                <CloudOff className="mx-auto h-8 w-8 text-ui-text-3" aria-hidden />
                <div className="mt-3 text-sm font-semibold text-ui-text-1">Forecast is unavailable</div>
                <div className="mt-1 text-xs text-ui-text-3">The latest weather update did not include daily forecast rows.</div>
            </div>
        )
    }

    return(
        <div>
            <indexOnPageContext.Provider value={index} >
            <div><ButtonPanleForTenDay onClick={setIndex} weatherForNextTenDay={weatherForNextTenDay} timezone={timezone}></ButtonPanleForTenDay></div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-ui-text-2">
                <div className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-ui-accent" aria-hidden />
                    <span>{selectedDayLabel}</span>
                </div>
                <span className="rounded-full border border-ui-stroke-soft/20 bg-ui-surface-1/60 px-3 py-1 text-xs text-ui-text-3">
                    {timezoneAbbreviation && timezone ? `${timezoneAbbreviation} / ${timezone}` : timezone ?? "Local forecast time"}
                </span>
            </div>
            <div><WeatherSVGMotion key={`weather-curve-${index}`} hourlyinfo={hourlyinfo} timezone={timezone} timezoneAbbreviation={timezoneAbbreviation} /></div>
            </indexOnPageContext.Provider>
        </div>
    )   
};

