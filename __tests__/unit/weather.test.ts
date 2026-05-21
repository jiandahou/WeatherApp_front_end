import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeatherApi } from 'openmeteo';
import { getWeatherForecast } from '@/lib/weather';

vi.mock('openmeteo', () => ({
  fetchWeatherApi: vi.fn(),
}));

const daySeconds = 86400;
const hourSeconds = 3600;
const dailyLength = 21;
const hourlyLength = dailyLength * 24;
const startSeconds = Date.UTC(2026, 4, 10) / 1000;

function series(length: number, valueForIndex: (index: number) => number) {
  return Float32Array.from(Array.from({ length }, (_, index) => valueForIndex(index)));
}

function variableArray(values: Float32Array[]) {
  return (index: number) => ({
    valuesArray: () => values[index],
  });
}

function currentVariable(values: number[]) {
  return (index: number) => ({
    value: () => values[index],
  });
}

describe('getWeatherForecast', () => {
  beforeEach(() => {
    const currentValues = [20, 50, 18, 1, 0, 0, 0, 0, 2, 1012, 1008, 9, 180];
    const dailyValues = Array.from({ length: 15 }, (_, variableIndex) =>
      series(dailyLength, (dayIndex) => variableIndex * 100 + dayIndex)
    );
    const hourlyValues = Array.from({ length: 13 }, (_, variableIndex) =>
      series(hourlyLength, (hourIndex) => variableIndex * 1000 + hourIndex)
    );

    vi.mocked(fetchWeatherApi).mockResolvedValue([
      {
        timezone: () => 'Asia/Shanghai',
        timezoneAbbreviation: () => 'GMT+8',
        current: () => ({
          time: () => BigInt(Date.UTC(2026, 4, 17, 10) / 1000),
          variables: currentVariable(currentValues),
        }),
        daily: () => ({
          time: () => BigInt(startSeconds),
          timeEnd: () => BigInt(startSeconds + dailyLength * daySeconds),
          interval: () => daySeconds,
          variables: variableArray(dailyValues),
        }),
        hourly: () => ({
          time: () => BigInt(startSeconds),
          timeEnd: () => BigInt(startSeconds + hourlyLength * hourSeconds),
          interval: () => hourSeconds,
          variables: variableArray(hourlyValues),
        }),
      },
    ] as any);
  });

  it('requests Open-Meteo with automatic timezone and expected day ranges', async () => {
    await getWeatherForecast(39.9042, 116.4074);

    expect(fetchWeatherApi).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        latitude: 39.9042,
        longitude: 116.4074,
        timezone: 'auto',
        past_days: 7,
        forecast_days: 14,
      })
    );
  });

  it('uses the first forecast day after the past-days window as today', async () => {
    const weather = (await getWeatherForecast(39.9042, 116.4074))!;

    expect(weather.daily.time.toISOString()).toBe('2026-05-17T10:00:00.000Z');
    expect(weather.daily.highestTemperature).toBe(107);
    expect(weather.daily.lowestTemperature).toBe(207);
    expect(weather.daily.precipitationProbabilityMax).toBe(1407);
    expect(weather.daily.weatherForNextTenDay[0].highestTemperature).toBe(107);
    expect(weather.daily.weatherForNextTenDay[0].time.toISOString()).toBe('2026-05-17T00:00:00.000Z');
  });

  it('keeps timezone metadata and starts hourly forecast at the local today window', async () => {
    const weather = (await getWeatherForecast(39.9042, 116.4074))!;

    expect(weather.daily.timezone).toBe('Asia/Shanghai');
    expect(weather.daily.timezoneAbbreviation).toBe('GMT+8');
    expect(weather.daily.latitude).toBe(39.9042);
    expect(weather.daily.longitude).toBe(116.4074);
    expect(weather.hourly[0].time.toISOString()).toBe('2026-05-17T00:00:00.000Z');
    expect(weather.hourly[0].temperature2m).toBe(168);
  });
});
