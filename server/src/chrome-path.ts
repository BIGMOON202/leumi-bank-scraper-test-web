import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function resolveChromeExecutablePath(): string | undefined {
  const fromEnv = process.env.CHROME_PATH?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  const localApp = process.env.LOCALAPPDATA;
  const candidates: string[] = [
    localApp ? path.join(localApp, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  if (os.platform() === 'darwin') {
    const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(mac)) {
      return mac;
    }
  }

  if (os.platform() === 'linux') {
    const linux = ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'];
    for (const p of linux) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }

  return undefined;
}
