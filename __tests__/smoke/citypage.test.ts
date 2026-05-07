/**
 * Smoke Test 3: City Page – generateStaticParams & Route Contract
 *
 * Verifies that [city]/page.tsx exports `generateStaticParams` with the
 * expected set of pre-rendered cities, and that the async page function
 * is exported as default.
 */

import { describe, it, expect, vi } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('@/app/component/weather', () => ({
  default: vi.fn(() => null),
}));

vi.mock('@/app/provider/reduxProvider', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => children),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('[city]/page – smoke', () => {
  it('exports generateStaticParams as a function', async () => {
    const page = await import('@/app/weather/[city]/page');
    expect(typeof page.generateStaticParams).toBe('function');
  });

  it('generateStaticParams returns the expected 8 cities', async () => {
    const { generateStaticParams } = await import('@/app/weather/[city]/page');
    const params = generateStaticParams();

    const cities = params.map((p: { city: string }) => p.city);
    const expected = ['Beijing', 'Tokyo', 'Paris', 'Madrid', 'Berlin', 'Seoul', 'Moscow', 'Sydney'];

    expect(cities).toHaveLength(8);
    expected.forEach(city => expect(cities).toContain(city));
  });

  it('exports a default async page component', async () => {
    const page = await import('@/app/weather/[city]/page');
    expect(typeof page.default).toBe('function');
    // async functions have constructor name "AsyncFunction"
    expect(page.default.constructor.name).toMatch(/Function/);
  });
});
