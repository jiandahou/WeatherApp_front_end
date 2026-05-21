import { describe, it, expect } from 'vitest';
import {
  createSavedCityFromWeather,
  getSavedCityCountry,
  getSavedCityIdentity,
  getSavedCityName,
  normalizeSavedCityCookie,
} from '@/app/utils/savedCities';

describe('saved city cookie helpers', () => {
  it('keeps legacy string cookies readable', () => {
    const city = normalizeSavedCityCookie('Sydney');

    expect(city).toBe('Sydney');
    expect(getSavedCityName(city!)).toBe('Sydney');
    expect(getSavedCityCountry(city!)).toBeUndefined();
    expect(getSavedCityIdentity(city!)).toBe('sydney');
  });

  it('normalizes object cookies with country and coordinates', () => {
    const city = normalizeSavedCityCookie({
      name: 'Sydney',
      country: 'AU',
      latitude: -33.8688,
      longitude: 151.2093,
    });

    expect(city).toEqual({
      name: 'Sydney',
      country: 'AU',
      latitude: -33.8688,
      longitude: 151.2093,
    });
    expect(getSavedCityIdentity(city!)).toBe('sydney:au');
  });

  it('rejects invalid cookie entries', () => {
    expect(normalizeSavedCityCookie('')).toBeNull();
    expect(normalizeSavedCityCookie({ country: 'AU' })).toBeNull();
    expect(normalizeSavedCityCookie(null)).toBeNull();
  });

  it('creates a persisted city record from weather data', () => {
    const city = createSavedCityFromWeather({
      daily: {
        location: 'Sydney',
        country: 'AU',
        latitude: -33.8688,
        longitude: 151.2093,
      },
      hourly: [],
    } as any);

    expect(city).toEqual({
      name: 'Sydney',
      country: 'AU',
      latitude: -33.8688,
      longitude: 151.2093,
    });
  });
});
