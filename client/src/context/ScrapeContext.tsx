import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ScrapeResult } from '../types';

export type SyncMode = 'live' | 'demo';

type ScrapeContextValue = {
  result: ScrapeResult | null;
  lastSyncAt: Date | null;
  lastSyncMode: SyncMode | null;
  setScrapeResult: (r: ScrapeResult, mode: SyncMode) => void;
  clearSession: () => void;
};

const ScrapeContext = createContext<ScrapeContextValue | null>(null);

export function ScrapeProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [lastSyncMode, setLastSyncMode] = useState<SyncMode | null>(null);

  const setScrapeResult = useCallback((r: ScrapeResult, mode: SyncMode) => {
    setResult(r);
    setLastSyncAt(new Date());
    setLastSyncMode(mode);
  }, []);

  const clearSession = useCallback(() => {
    setResult(null);
    setLastSyncAt(null);
    setLastSyncMode(null);
  }, []);

  const value = useMemo(
    () => ({
      result,
      lastSyncAt,
      lastSyncMode,
      setScrapeResult,
      clearSession,
    }),
    [result, lastSyncAt, lastSyncMode, setScrapeResult, clearSession],
  );

  return <ScrapeContext.Provider value={value}>{children}</ScrapeContext.Provider>;
}

export function useScrape() {
  const ctx = useContext(ScrapeContext);
  if (!ctx) {
    throw new Error('useScrape must be used within ScrapeProvider');
  }
  return ctx;
}
