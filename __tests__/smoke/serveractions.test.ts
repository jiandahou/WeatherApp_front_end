import { describe, it, expect, vi, beforeAll } from 'vitest';

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
  fetchWeatherApi: vi.fn(),
}));

describe('Server Actions', () => {
  let actions: typeof import('@/app/action/serveractions');

  beforeAll(async () => {
    actions = await import('@/app/action/serveractions');
  });

  it('exports GetWeatherSummary as an async function', () => {
    expect(typeof actions.GetWeatherSummary).toBe('function');

    const result = actions.GetWeatherSummary({
      location: 'Beijing',
      time: new Date(),
      temperatureNow: 20,
      apparentTemperatureNow: 18,
      windSpeed10m: 5,
      windDirection10m: 180,
      precipitation: 0,
      weatherCode: 0,
      highestTemperature: 25,
      lowestTemperature: 15,
      precipitationProbabilityMax: 10,
      sunshineDuration: 36000,
    } as any);

    expect(result).toBeInstanceOf(Promise);
  });

  it('exports GetWeatherForecast as a function', () => {
    expect(typeof actions.GetWeatherForecast).toBe('function');
  });

  it('GetWeatherSummary resolves to a string with mocked OpenAI', async () => {
    const summary = await actions.GetWeatherSummary({
      location: 'Beijing',
      time: new Date(),
      temperatureNow: 22,
      apparentTemperatureNow: 20,
      windSpeed10m: 10,
      windDirection10m: 90,
      precipitation: 0,
      weatherCode: 1,
      highestTemperature: 28,
      lowestTemperature: 16,
      precipitationProbabilityMax: 5,
      sunshineDuration: 40000,
    } as any);

    expect(typeof summary).toBe('string');
    expect((summary ?? '').length).toBeGreaterThan(0);
  });
});
