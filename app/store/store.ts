import { configureStore, createSerializableStateInvariantMiddleware, isPlain } from '@reduxjs/toolkit';
import weatherReducer from './slice/weatherSlice';

const serializableMiddleware = createSerializableStateInvariantMiddleware({
  // Keep strict checks on, but allow Date values used by weather time fields.
  isSerializable: (value: unknown) => value instanceof Date || isPlain(value),
});

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(serializableMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;