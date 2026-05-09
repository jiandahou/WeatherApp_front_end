import type { weatherinfoFetched } from '../type/weatherType';
"use client"
import { useEffect } from 'react';
import { setWeatherState } from '../store/slice/weatherSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';

/**
 * Injects server-fetched weather data into the Redux store once after mount.
 * The outer StoreProvider (in layout.tsx) owns the <Provider> — this component
 * is intentionally just a data-injection bridge, not a store owner.
 */
export default function ReduxProvider({ params, children }: { params: weatherinfoFetched; children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setWeatherState(params));
  }, [params]);

  return <>{children}</>;
}
