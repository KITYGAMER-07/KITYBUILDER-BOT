import { firebaseAuth } from './firebase';

// This is a public URL. The Telegram bot token stays only in the Worker secret.
const brandBotApiUrl = (
  import.meta.env.VITE_BRAND_BOT_API_URL ||
  'https://kitybuilderbot.kitygamertrashbin.workers.dev'
).replace(/\/$/, '');

export class BrandBotApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrandBotApiError';
  }
}

export const brandBotRequest = async (path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  const user = firebaseAuth.currentUser;

  if (user) {
    headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  }

  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${brandBotApiUrl}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new BrandBotApiError(payload?.error || 'The KITYBUILDER Bot service is unavailable.');
  }

  return payload;
};
