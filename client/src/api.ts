import type { ScrapeResult } from './types';

const base = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

export async function fetchDemo(): Promise<ScrapeResult> {
  const res = await fetch(`${base}/api/demo`);
  if (!res.ok) {
    throw new Error(`Demo failed: ${res.status}`);
  }
  return (await res.json()) as ScrapeResult;
}

export async function fetchScrape(payload: {
  username: string;
  password: string;
  startDate: string;
  showBrowser: boolean;
}): Promise<ScrapeResult> {
  const res = await fetch(`${base}/api/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as ScrapeResult;
  return data;
}
