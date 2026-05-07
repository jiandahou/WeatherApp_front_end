"use client";
import { Provider } from 'react-redux';
import { store } from '../store/store';

/**
 * Minimal client-boundary wrapper that provides the Redux store.
 * Kept as small as possible so the root layout can remain a Server Component.
 */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
