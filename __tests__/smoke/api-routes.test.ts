/**
 * Smoke Test 2: API Routes – Handler Export Verification
 *
 * Confirms that each API route exports the expected HTTP handler functions,
 * which is required for Next.js App Router route conventions.
 */

import { describe, it, expect, vi } from 'vitest';

// ── Shared mocks ─────────────────────────────────────────────────────────────
vi.mock('@/lib/weather', () => ({
  getWeatherForecast: vi.fn().mockResolvedValue({ daily: { temperature_2m_max: [22] } }),
}));

vi.mock('@/lib/weatherSummary', () => ({
  getWeatherSummary: vi.fn().mockResolvedValue('Clear skies today.'),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => data,
    })),
  },
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('API Route /api/weather – smoke', () => {
  it('exports a GET handler', async () => {
    const route = await import('@/app/api/weather/route');
    expect(typeof route.GET).toBe('function');
  });

  it('GET returns 400 when body is missing coordinates', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const fakeReq = new Request('https://example.test/api/weather');

    const res = await GET(fakeReq);
    expect(res.status).toBe(400);
  });
});

describe('API Route /api/weatherSummary – smoke', () => {
  it('exports a POST handler', async () => {
    const route = await import('@/app/api/weatherSummary/route');
    expect(typeof route.POST).toBe('function');
  });

  it('POST returns a response object', async () => {
    const { POST } = await import('@/app/api/weatherSummary/route');
    const fakeReq = {
      json: vi.fn().mockResolvedValue({ location: 'Sydney', time: Date.now() }),
    } as unknown as Request;

    const res = await POST(fakeReq);
    expect(res).toBeDefined();
  });
});
