import { WeatherCodeInterpretator } from "./weatherCodeInterpretation";

export type WeatherBackgroundPreset = {
    file: string;
    overlay: string;
    accent: string;
};

const fallbackWeatherKey = "ClearDay";

const weatherBackgroundPresets: Record<string, WeatherBackgroundPreset> = {
    ClearDay: { file: "clear-day-bg", overlay: "from-ui-overlay-weak/20 via-transparent to-ui-overlay-strong/55", accent: "from-ui-accent/45" },
    MainlyClear: { file: "mainly-clear-bg", overlay: "from-ui-overlay-weak/25 via-transparent to-ui-overlay-strong/60", accent: "from-ui-accent/50" },
    Cloudy: { file: "cloudy-bg", overlay: "from-ui-overlay-weak/40 via-transparent to-ui-overlay-strong/70", accent: "from-ui-stroke-soft/50" },
    Overcast: { file: "overcast-bg", overlay: "from-ui-overlay-weak/50 via-transparent to-ui-overlay-strong/80", accent: "from-ui-stroke-soft/45" },
    Fog: { file: "fog-bg", overlay: "from-ui-overlay-weak/60 via-transparent to-ui-overlay-strong/85", accent: "from-ui-text-3/35" },
    DepositingRime: { file: "rime-frost-bg", overlay: "from-ui-overlay-weak/45 via-transparent to-ui-overlay-strong/75", accent: "from-ui-state-info/50" },
    LightDrizzle: { file: "light-drizzle-bg", overlay: "from-ui-overlay-weak/45 via-transparent to-ui-overlay-strong/75", accent: "from-ui-state-info/55" },
    ModerateDrizzle: { file: "moderate-drizzle-bg", overlay: "from-ui-overlay-weak/50 via-transparent to-ui-overlay-strong/78", accent: "from-ui-state-info/60" },
    DenseDrizzle: { file: "dense-drizzle-bg", overlay: "from-ui-overlay-weak/58 via-transparent to-ui-overlay-strong/82", accent: "from-ui-state-info/65" },
    LightFreezeDrizzle: { file: "light-freeze-drizzle-bg", overlay: "from-ui-overlay-weak/48 via-transparent to-ui-overlay-strong/78", accent: "from-ui-state-info/60" },
    DenseFreezeDrizzle: { file: "dense-freeze-drizzle-bg", overlay: "from-ui-overlay-weak/58 via-transparent to-ui-overlay-strong/84", accent: "from-ui-state-info/65" },
    LightRain: { file: "light-rain-bg", overlay: "from-ui-overlay-weak/46 via-transparent to-ui-overlay-strong/76", accent: "from-ui-state-info/60" },
    ModerateRain: { file: "moderate-rain-bg", overlay: "from-ui-overlay-weak/54 via-transparent to-ui-overlay-strong/82", accent: "from-ui-state-info/66" },
    DenseRain: { file: "dense-rain-bg", overlay: "from-ui-overlay-weak/62 via-transparent to-ui-overlay-strong/88", accent: "from-ui-state-info/72" },
    LightFreezeRain: { file: "light-freeze-rain-bg", overlay: "from-ui-overlay-weak/52 via-transparent to-ui-overlay-strong/82", accent: "from-ui-state-info/66" },
    DenseFreezeRain: { file: "dense-freeze-rain-bg", overlay: "from-ui-overlay-weak/66 via-transparent to-ui-overlay-strong/90", accent: "from-ui-state-info/72" },
    LightSnow: { file: "light-snow-bg", overlay: "from-ui-overlay-weak/36 via-transparent to-ui-overlay-strong/68", accent: "from-ui-state-success/45" },
    ModerateSnow: { file: "moderate-snow-bg", overlay: "from-ui-overlay-weak/44 via-transparent to-ui-overlay-strong/74", accent: "from-ui-state-success/52" },
    DenseSnow: { file: "dense-snow-bg", overlay: "from-ui-overlay-weak/52 via-transparent to-ui-overlay-strong/80", accent: "from-ui-state-success/58" },
    SnowGrains: { file: "snow-grains-bg", overlay: "from-ui-overlay-weak/42 via-transparent to-ui-overlay-strong/72", accent: "from-ui-state-success/48" },
    LightRainshowers: { file: "light-rainshowers-bg", overlay: "from-ui-overlay-weak/46 via-transparent to-ui-overlay-strong/78", accent: "from-ui-state-info/60" },
    ModerateRainshowers: { file: "moderate-rainshowers-bg", overlay: "from-ui-overlay-weak/54 via-transparent to-ui-overlay-strong/82", accent: "from-ui-state-info/66" },
    DenseRainshowers: { file: "dense-rainshowers-bg", overlay: "from-ui-overlay-weak/62 via-transparent to-ui-overlay-strong/88", accent: "from-ui-state-info/72" },
    SnowShowers: { file: "heavy-showers-bg", overlay: "from-ui-overlay-weak/55 via-transparent to-ui-overlay-strong/84", accent: "from-ui-state-success/60" },
    HeavyShowers: { file: "heavy-showers-bg", overlay: "from-ui-overlay-weak/60 via-transparent to-ui-overlay-strong/88", accent: "from-ui-state-success/64" },
    SlightThunderstrom: { file: "slight-thunderstorm-bg", overlay: "from-ui-overlay-weak/60 via-transparent to-ui-overlay-strong/88", accent: "from-ui-state-warn/60" },
    ThunderstormwithHail: { file: "thunder-hail-bg", overlay: "from-ui-overlay-weak/68 via-transparent to-ui-overlay-strong/92", accent: "from-ui-state-warn/70" },
};

export function resolveWeatherKeyByCode(weatherCode: number | null | undefined): string {
    if (typeof weatherCode !== "number") {
        return fallbackWeatherKey;
    }

    const weatherKey = WeatherCodeInterpretator[weatherCode];
    if (!weatherKey) {
        return fallbackWeatherKey;
    }

    return weatherBackgroundPresets[weatherKey] ? weatherKey : fallbackWeatherKey;
}

export function resolveWeatherBackgroundByCode(weatherCode: number | null | undefined): WeatherBackgroundPreset {
    const weatherKey = resolveWeatherKeyByCode(weatherCode);
    return weatherBackgroundPresets[weatherKey] ?? weatherBackgroundPresets[fallbackWeatherKey];
}

export function resolveWeatherIconSrcByCode(weatherCode: number | null | undefined): string {
    const weatherKey = resolveWeatherKeyByCode(weatherCode);
    return `/${weatherKey}.svg`;
}

export function resolveWeatherIconFallbackSrc(): string {
    return `/${fallbackWeatherKey}.svg`;
}

export function getWeatherBackgroundPresetList(): WeatherBackgroundPreset[] {
    return Object.values(weatherBackgroundPresets);
}
