import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';
import weatherReducer from '@/app/store/slice/weatherSlice';
import WeatherLocationSearchBar from '@/app/component/weather_Location_SearchBar';

const mocks = vi.hoisted(() => ({
  searchCities: vi.fn(),
  fetchWeatherByCoordinates: vi.fn(),
  getTheCityInfo: vi.fn(),
}));

vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn(),
  },
}));

vi.mock('aws-amplify/data', () => ({
  generateClient: vi.fn(() => ({
    queries: {
      searchCities: mocks.searchCities,
    },
  })),
}));

vi.mock('use-debounce', () => ({
  useDebounce: <T,>(value: T) => [value],
}));

vi.mock('motion/react', async () => {
  const ReactModule = await import('react');
  const stripMotionProps = (Tag: keyof JSX.IntrinsicElements) =>
    ReactModule.forwardRef<any, any>((props, ref) => {
      const {
        animate,
        exit,
        initial,
        layout,
        transition,
        whileFocus,
        whileHover,
        whileTap,
        ...rest
      } = props;

      return ReactModule.createElement(Tag, { ...rest, ref });
    });

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      button: stripMotionProps('button'),
      div: stripMotionProps('div'),
      input: stripMotionProps('input'),
    },
  };
});

vi.mock('@/app/action/serveractions', () => ({
  GetTheCityInfo: mocks.getTheCityInfo,
}));

vi.mock('@/app/utils/weatherApiClient', () => ({
  fetchWeatherByCoordinates: mocks.fetchWeatherByCoordinates,
}));

function makeStore() {
  return configureStore({
    reducer: {
      weather: weatherReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

function makeWeather() {
  return {
    daily: {
      time: new Date('2026-05-19T00:00:00.000Z'),
      temperatureNow: 18,
      apparentTemperatureNow: 18,
      isDay: 1,
      precipitation: 0,
      rain: 0,
      showers: 0,
      snowfall: 0,
      weatherCode: 1,
      pressureMsl: 1013,
      surfacePressure: 1010,
      windSpeed10m: 8,
      windDirection10m: 120,
      highestTemperature: 22,
      lowestTemperature: 14,
      highestApparentTemperature: 22,
      daylightDuration: 36000,
      sunshineDuration: 20000,
      precipitationSum: 0,
      rainsum: 0,
      showersSum: 0,
      snowfallSum: 0,
      precipitationHours: 0,
      precipitationProbabilityMax: 5,
      weatherForNextTenDay: [],
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: 'Australia/Sydney',
      timezoneAbbreviation: 'AEST',
    },
    hourly: [],
  };
}

async function waitForExpectation(assertion: () => void, timeoutMs = 1000) {
  const startedAt = Date.now();

  while (true) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() - startedAt > timeoutMs) throw error;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
}

describe('WeatherLocationSearchBar', () => {
  beforeEach(() => {
    mocks.searchCities.mockReset();
    mocks.fetchWeatherByCoordinates.mockReset();
    mocks.getTheCityInfo.mockReset();

    mocks.searchCities.mockResolvedValue({
      data: [
        {
          name: 'Sydney',
          lat: -33.8688,
          lng: 151.2093,
          country: 'AU',
          admin1: 'New South Wales',
          admin2: '',
        },
      ],
    });
    mocks.fetchWeatherByCoordinates.mockResolvedValue(makeWeather());
  });

  it('selects a search result on the first pointer interaction', async () => {
    const store = makeStore();

    const view = render(
      <Provider store={store}>
        <WeatherLocationSearchBar />
      </Provider>
    );

    await act(async () => {
      fireEvent.change(view.getByRole('combobox', { name: /search cities/i }), {
        target: { value: 'Sydney' },
      });
    });

    const option = await view.findByRole('option', { name: /Sydney, AU/i });
    await act(async () => {
      fireEvent.pointerDown(option.querySelector('button')!);
    });

    await waitForExpectation(() => {
      expect(store.getState().weather.weatherinfo?.daily.location).toBe('Sydney');
    });

    expect(store.getState().weather.weatherinfo?.daily.country).toBe('AU');
    expect(mocks.fetchWeatherByCoordinates).toHaveBeenCalledTimes(1);
    expect(mocks.fetchWeatherByCoordinates).toHaveBeenCalledWith(-33.8688, 151.2093);
  });
});
