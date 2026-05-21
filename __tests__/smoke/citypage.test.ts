import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCityInfo: vi.fn(),
  getWeatherForecast: vi.fn(),
}));

vi.mock('@/app/component/weather', () => ({
  default: vi.fn(() => null),
}));

vi.mock('@/app/provider/reduxProvider', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => children),
}));

vi.mock('@/lib/cities', () => ({
  getCityInfo: mocks.getCityInfo,
}));

vi.mock('@/lib/weather', () => ({
  getWeatherForecast: mocks.getWeatherForecast,
}));

function makeWeatherData() {
  return {
    daily: {
      weatherForNextTenDay: [],
    },
    hourly: [],
  };
}

describe('[city]/page', () => {
  beforeEach(() => {
    mocks.getCityInfo.mockReset();
    mocks.getWeatherForecast.mockReset();
    mocks.getWeatherForecast.mockResolvedValue(makeWeatherData());
  });

  it('exports generateStaticParams as a function', async () => {
    const page = await import('@/app/weather/[city]/page');
    expect(typeof page.generateStaticParams).toBe('function');
  });

  it('generateStaticParams returns the expected pre-rendered cities', async () => {
    const { generateStaticParams } = await import('@/app/weather/[city]/page');
    const params = generateStaticParams();

    const cities = params.map((p: { city: string }) => p.city);
    const expected = ['Beijing', 'Tokyo', 'Paris', 'Madrid', 'Berlin', 'Seoul', 'Moscow', 'Sydney'];

    expect(cities).toHaveLength(8);
    expected.forEach((city) => expect(cities).toContain(city));
  });

  it('uses the known Australian coordinates for Sydney instead of geocoding by name', async () => {
    const page = await import('@/app/weather/[city]/page');

    await page.default({
      params: Promise.resolve({ city: 'Sydney' }),
    });

    expect(mocks.getCityInfo).not.toHaveBeenCalled();
    expect(mocks.getWeatherForecast).toHaveBeenCalledWith(-33.8688, 151.2093);
  });

  it('exports a default async page component', async () => {
    const page = await import('@/app/weather/[city]/page');
    expect(typeof page.default).toBe('function');
    expect(page.default.constructor.name).toMatch(/Function/);
  });
});
