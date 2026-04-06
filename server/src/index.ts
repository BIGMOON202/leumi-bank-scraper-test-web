import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { CompanyTypes, createScraper } from 'israeli-bank-scrapers';
import { resolveChromeExecutablePath } from './chrome-path.js';
import { demoScrapeResult } from './demo-result.js';

process.env.TZ = process.env.TZ ?? 'Asia/Jerusalem';

const PORT = Number(process.env.PORT) || 8787;

const app = express();
app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',').map((s) => s.trim()) ?? true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '48kb' }));

const scrapeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, errorType: 'RATE_LIMIT', errorMessage: 'Too many scrape attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/demo', (_req, res) => {
  res.json(structuredClone(demoScrapeResult));
});

type ScrapeBody = {
  username?: string;
  password?: string;
  startDate?: string;
  showBrowser?: boolean;
};

app.post('/api/scrape', scrapeLimiter, async (req, res) => {
  const body = req.body as ScrapeBody;
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const showBrowser = Boolean(body.showBrowser);

  if (!username || !password) {
    res.status(400).json({
      success: false,
      errorType: 'GENERIC',
      errorMessage: 'username and password are required',
    });
    return;
  }

  const start = body.startDate ? new Date(body.startDate) : new Date();
  if (Number.isNaN(start.getTime())) {
    res.status(400).json({
      success: false,
      errorType: 'GENERIC',
      errorMessage: 'Invalid startDate',
    });
    return;
  }

  const executablePath = resolveChromeExecutablePath();

  const options = {
    companyId: CompanyTypes.leumi,
    startDate: start,
    combineInstallments: false,
    showBrowser,
    ...(executablePath ? { executablePath } : {}),
  };

  try {
    const scraper = createScraper(options);
    const result = await scraper.scrape({ username, password });
    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({
      success: false,
      errorType: 'UNKNOWN_ERROR',
      errorMessage: message,
    });
  }
});

app.listen(PORT, () => {
  // Never log request bodies (may contain credentials)
  console.log(`Leumi scrape API listening on http://127.0.0.1:${PORT}`);
});
