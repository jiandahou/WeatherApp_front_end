/**
 * Smoke Test 1: Server Actions – Contract Verification
 *
 * Verifies that the critical server-action exports exist and are async functions.
 * These do NOT call real APIs – external modules are mocked.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// ── Mock heavy / external dependencies ─────────────────────────────────────
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock summary.' } }],
        }),
      },
    },
  })),
}));

vi.mock('openmeteo', () => ({
  fetchWeatherApi: vi.fn().mockResolvedValue([
    {
      current: () => ({
        variables: () => ({ value: () => 20 }),
        time: () => BigInt(Date.now() / 1000),
      }),
      daily: () => ({
        variables: () => ({ valuesArray: () => new Float32Array([20, 22]) }),
        time: () => BigInt(Date.now() / 1000),
        timeEnd: () => BigInt(Date.now() / 1000 + 86400 * 10),
        interval: () => 86400,
      }),
      hourly: () => ({
        variables: () => ({ valuesArray: () => new Float32Array([20]) }),
        time: () => BigInt(Date.now() / 1000),
        timeEnd: () => BigInt(Date.now() / 1000 + 3600 * 24),
        interval: () => 3600,
      }),
    },
  ]),
}));

vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
  config: vi.fn(),
}));

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Server Actions – smoke', () => {
  let actions: typeof import('@/app/action/serveractions');

  beforeAll(async () => {
    actions = await import('@/app/action/serveractions');
  });

  it('exports GetWeatherSummary as an async function', () => {
    expect(typeof actions.GetWeatherSummary).toBe('function');
    // async functions return a Promise
    const fakeInput = {
      location: 'Beijing',
      time: Date.now(),
      temperatureNow: 20,
      apparentTemperatureNow: 18,
      windSpeed10m: 5,
      windDirection10m: 180,
      precipitation: 0,
      weatherCode: 0,
      highestTemperature: 25,
      lowestTemperature: 15,
      recipitationProbabilityMax: 10,
      sunshineDuration: 36000,
    };
    const result = actions.GetWeatherSummary(fakeInput as any);
    expect(result).toBeInstanceOf(Promise);
  });

  it('exports GetWeatherForecast as a function', () => {
    expect(typeof actions.GetWeatherForecast).toBe('function');
  });

  it('GetWeatherSummary resolves to a string (mocked)', async () => {
    const summary = await actions.GetWeatherSummary({
      location: 'Beijing',
      time: Date.now(),
      temperatureNow: 22,
      apparentTemperatureNow: 20,
      windSpeed10m: 10,
      windDirection10m: 90,
      precipitation: 0,
      weatherCode: 1,
      highestTemperature: 28,
      lowestTemperature: 16,
      recipitationProbabilityMax: 5,
      sunshineDuration: 40000,
    } as any);
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });
});
