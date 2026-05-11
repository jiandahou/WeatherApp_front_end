import type { locationWeather } from '../type/weatherType';
"use client"

import { useEffect, useRef, useState } from "react";
import { WeatherCodeInterpretator } from "../weatherCode/weatherCodeInterpretation";
import { getWeatherBackgroundPresetList, resolveWeatherBackgroundByCode, resolveWeatherIconFallbackSrc, resolveWeatherIconSrcByCode } from "../weatherCode/weatherVisualTokens";
import { useClock } from "../hooks/useClock";
import Image from 'next/image';
import useSWR from "swr";

export default function MainWeatherPanel({
    summary,
    weatherNow,
}: {
    summary?: string | null;
    weatherNow: locationWeather;
}) {
    const timeString = useClock();
    const weathername = WeatherCodeInterpretator[weatherNow.weatherCode];
    const weatherIconSrc = resolveWeatherIconSrcByCode(weatherNow.weatherCode);
    const weatherIconFallbackSrc = resolveWeatherIconFallbackSrc();
    const backgroundPreset = resolveWeatherBackgroundByCode(weatherNow.weatherCode);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [canExpandSummary, setCanExpandSummary] = useState(false);
    const summaryMeasureRef = useRef<HTMLSpanElement>(null);

    const fetchSummary = async (weatherInfo: locationWeather): Promise<string | null> => {
        const res = await fetch("/api/weatherSummary", {
            method: "POST",
            body: JSON.stringify(weatherInfo),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data?.summary ?? null;
    };

    const { data: liveSummary } = useSWR(
        ["weather-summary", weatherNow.location, weatherNow.weatherCode, weatherNow.temperatureNow],
        () => fetchSummary(weatherNow),
        {
            dedupingInterval: 1000 * 60 * 10,
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            fallbackData: summary ?? undefined,
            keepPreviousData: false,
        }
    );

    useEffect(() => {
        getWeatherBackgroundPresetList().forEach(({ file }) => {
            const img = new window.Image();
            img.src = `/backgrounds/${file}.jpg`;
        });
    }, []);

    const cityCountryLabel = weatherNow.country ? weatherNow.country : "Unknown";
    const summaryText = liveSummary ?? `Today Weather is ${weathername}. The highest temperature is ${Math.round(weatherNow.highestTemperature)}°C.`;
    const shouldClampSummary = !isSummaryExpanded;

    useEffect(() => {
        setIsSummaryExpanded(false);

        const measureOverflow = () => {
            const element = summaryMeasureRef.current;
            if (!element) return;
            setCanExpandSummary(element.scrollHeight > element.clientHeight + 1);
        };

        const raf = window.requestAnimationFrame(measureOverflow);
        window.addEventListener("resize", measureOverflow);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener("resize", measureOverflow);
        };
    }, [summaryText]);

    return (
        <section
            className="relative overflow-hidden rounded-3xl border border-ui-stroke-soft/30 bg-cover bg-center shadow-xl z-0 text-ui-text-1 drop-shadow-md"
            style={{
                backgroundImage: `url('/backgrounds/${backgroundPreset.file}.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className={`absolute inset-0 bg-gradient-to-b ${backgroundPreset.overlay}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_36%)]" />
            <div className="absolute inset-0 opacity-70 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:88px_88px]" />
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${backgroundPreset.accent} to-transparent`} />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ui-overlay-strong/50 to-transparent" />

            <div className="relative px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div role="status" aria-live="polite" className="panel-surface rounded-full border border-ui-accent/20 px-4 py-2 text-sm text-ui-text-2 shadow-panelSoft">
                        Weather Now · {timeString}
                    </div>
                    <div className="panel-surface rounded-full border border-ui-stroke-soft/20 px-4 py-2 text-sm text-ui-text-2">
                        {weatherNow.location}
                    </div>
                    <div className="panel-surface rounded-full border border-ui-stroke-soft/20 px-4 py-2 text-sm text-ui-text-2">
                        {cityCountryLabel}
                    </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:items-stretch">
                    <div className="grid gap-4 h-full">
                        <div className="panel-surface-strong h-full rounded-3xl border border-ui-accent/20 p-4 shadow-panelGlow sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="rounded-2xl border border-ui-stroke-soft/25 bg-ui-overlay-strong/30 p-2 shadow-panelSoft sm:p-3">
                                        <Image
                                            src={weatherIconSrc}
                                            alt={weathername}
                                            width={88}
                                            height={88}
                                            loading="eager"
                                            className="h-16 w-16 sm:h-[88px] sm:w-[88px]"
                                            onError={(e) => { (e.target as HTMLImageElement).src = weatherIconFallbackSrc; }}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.22em] text-ui-text-3 sm:text-sm sm:tracking-[0.35em]">Current Condition</div>
                                        <div className="mt-2 text-[2.1rem] font-semibold leading-tight sm:text-4xl">{weathername}</div>
                                        <div className="mt-2 text-sm text-ui-text-2">
                                            Feels like {Math.round(weatherNow.apparentTemperatureNow)}° · High {Math.round(weatherNow.highestTemperature)}°
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right">
                                    <div className="flex items-start justify-end gap-2 leading-none">
                                        <div className="text-6xl font-semibold tracking-tight sm:text-8xl">{weatherNow.temperatureNow.toFixed()}</div>
                                        <div className="pt-1 text-xl text-ui-text-2 sm:pt-2 sm:text-3xl">°C</div>
                                    </div>
                                    <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-ui-text-3 sm:text-xs sm:tracking-[0.3em]">Live Temperature</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="panel-surface flex h-full min-h-[130px] flex-col items-center justify-center rounded-2xl border border-ui-stroke-soft/15 p-4 text-center text-ui-text-1">
                                <div className="text-xs uppercase tracking-[0.28em] text-ui-text-3">Sunshine</div>
                                <div className="mt-2 text-2xl font-semibold">{(weatherNow.sunshineDuration / 3600).toFixed(1)}h</div>
                            </div>
                            <div className="panel-surface flex h-full min-h-[130px] flex-col items-center justify-center rounded-2xl border border-ui-stroke-soft/15 p-4 text-center text-ui-text-1">
                                <div className="text-xs uppercase tracking-[0.28em] text-ui-text-3">Wind</div>
                                <div className="mt-2 text-2xl font-semibold">{weatherNow.windSpeed10m.toFixed()} kmh</div>
                            </div>
                            <div className="panel-surface flex h-full min-h-[130px] flex-col items-center justify-center rounded-2xl border border-ui-stroke-soft/15 p-4 text-center text-ui-text-1">
                                <div className="text-xs uppercase tracking-[0.28em] text-ui-text-3">Rain</div>
                                <div className="mt-2 text-2xl font-semibold">{weatherNow.rainsum.toFixed(2)}</div>
                            </div>
                            <div className="panel-surface flex h-full min-h-[130px] flex-col items-center justify-center rounded-2xl border border-ui-stroke-soft/15 p-4 text-center text-ui-text-1">
                                <div className="text-xs uppercase tracking-[0.28em] text-ui-text-3">Daylight</div>
                                <div className="mt-2 text-2xl font-semibold">{(weatherNow.daylightDuration / 3600).toFixed(0)}h</div>
                            </div>
                        </div>
                    </div>

                    <aside className="panel-surface-strong flex h-full flex-col rounded-3xl border border-ui-accent/20 p-5 shadow-panelGlow sm:p-6">
                        <div className="text-sm uppercase tracking-[0.35em] text-ui-text-3">Forecast Brief</div>
                        <div className="mt-3 text-lg font-semibold text-ui-text-1">{weathername}</div>
                        <div className="mt-3 flex items-center gap-3 text-sm text-ui-text-2">
                            <Image src="/ApparentTemperature.png" width={24} height={24} alt="Apparent Temperature" />
                            <span>Apparent temperature {Math.round(weatherNow.apparentTemperatureNow)}°</span>
                        </div>

                        <div role="status" aria-live="polite" className="mt-4 min-h-[12rem] rounded-2xl border border-dashed border-ui-stroke-soft/20 bg-ui-overlay-weak/20 p-4 text-sm leading-6 text-ui-text-2">
                            <span
                                ref={summaryMeasureRef}
                                style={shouldClampSummary ? {
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 5,
                                    overflow: 'hidden',
                                } : undefined}
                            >
                                {summaryText}
                            </span>
                            {canExpandSummary ? (
                                <button
                                    type="button"
                                    onClick={() => setIsSummaryExpanded((value) => !value)}
                                    className="mt-3 inline-flex items-center rounded-full border border-ui-stroke-soft/20 bg-ui-surface-1/70 px-3 py-1 text-xs font-medium text-ui-text-1 transition-colors hover:bg-ui-surface-2/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70"
                                    aria-expanded={isSummaryExpanded}
                                >
                                    {isSummaryExpanded ? "Show less" : "Show full summary"}
                                </button>
                            ) : null}
                        </div>

                        <div className="mt-4 grid gap-3">
                            <div className="rounded-2xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 p-4">
                                <div className="text-xs uppercase tracking-[0.25em] text-ui-text-3">Pressure</div>
                                <div className="mt-2 text-2xl font-semibold">{weatherNow.pressureMsl.toFixed(0)} hPa</div>
                            </div>
                            <div className="rounded-2xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 p-4">
                                <div className="text-xs uppercase tracking-[0.25em] text-ui-text-3">Snowfall</div>
                                <div className="mt-2 text-2xl font-semibold">{weatherNow.snowfall.toFixed(3)}%</div>
                            </div>
                            <div className="rounded-2xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 p-4">
                                <div className="text-xs uppercase tracking-[0.25em] text-ui-text-3">Weather Code</div>
                                <div className="mt-2 text-2xl font-semibold">{weatherNow.weatherCode}</div>
                            </div>
                        </div>
                    </aside>
                </div>

            </div>
        </section>
    );
}
