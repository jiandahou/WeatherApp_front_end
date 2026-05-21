import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeatherForecast } from '@/lib/weather';

vi.mock('@/lib/weather', () => ({
  getWeatherForecast: vi.fn().mockResolvedValue({
    daily: { location: 'Sydney', country: 'AU' },
    hourly: [],
  }),
}));

vi.mock('@/lib/weatherSummary', () => ({
  getWeatherSummary: vi.fn().mockResolvedValue('Clear skies today.'),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      headers: new Headers(init?.headers),
      json: async () => data,
    })),
  },
}));

describe('API Route /api/weather', () => {
  beforeEach(() => {
    vi.mocked(getWeatherForecast).mockClear();
  });

  it('exports a GET handler', async () => {
    const route = await import('@/app/api/weather/route');
    expect(typeof route.GET).toBe('function');
  });

  it('returns 400 when coordinates are missing', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(new Request('https://example.test/api/weather'));

    expect(res.status).toBe(400);
    expect(getWeatherForecast).not.toHaveBeenCalled();
  });

  it('returns 400 when coordinates are outside valid ranges', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(new Request('https://example.test/api/weather?latitude=91&longitude=151'));

    expect(res.status).toBe(400);
    expect(getWeatherForecast).not.toHaveBeenCalled();
  });

  it('returns weather data and cache headers for valid coordinates', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const res = await GET(new Request('https://example.test/api/weather?latitude=-33.8688&longitude=151.2093'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('s-maxage=300, stale-while-revalidate=600');
    expect(getWeatherForecast).toHaveBeenCalledWith(-33.8688, 151.2093);
  });
});

describe('API Route /api/weatherSummary', () => {
  it('exports a POST handler', async () => {
    const route = await import('@/app/api/weatherSummary/route');
    expect(typeof route.POST).toBe('function');
  });

  it('POST returns a summary response object', async () => {
    const { POST } = await import('@/app/api/weatherSummary/route');
    const fakeReq = {
      json: vi.fn().mockResolvedValue({ location: 'Sydney', time: Date.now() }),
    } as unknown as Request;

    const res = await POST(fakeReq);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ summary: 'Clear skies today.' });
  });
});
