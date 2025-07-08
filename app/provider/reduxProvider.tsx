"use client"
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { setWeatherState } from '../store/slice/weatherSlice';
import { useDispatch } from 'react-redux';

export default function ReduxProvider({ params, children }: { params: weatherinfoFetched; children: React.ReactNode }) {
  const dispatch = useDispatch();
    // Ensure params is of the correct type
    dispatch(setWeatherState(params))
  return <Provider store={store}>{children}</Provider>;
}
