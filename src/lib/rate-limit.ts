import { Redis } from '@upstash/redis';

/**
 * Einfache Begrenzung von Anfragen (z. B. Login-Versuche, Zusagen).
 *
 * Läuft im Proxy und in Server Actions, deshalb ohne `server-only` und ohne
 * Node-Dateizugriffe. Mit Upstash Redis gilt das Limit über alle Instanzen,
 * sonst (lokal) nur im jeweiligen Prozess.
 */

const PREFIX = 'cvhochzeit';

let client: Redis | null | undefined;
function redis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  client = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;
  return client;
}

const memoryHits = new Map<string, { count: number; resetAt: number }>();

/**
 * Zählt einen Versuch für `key`. Gibt `false` zurück, wenn im Zeitfenster
 * mehr als `limit` Versuche stattgefunden haben.
 */
export async function hitRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const fullKey = `${PREFIX}:rl:${key}`;
  const r = redis();
  if (r) {
    try {
      const count = await r.incr(fullKey);
      if (count === 1) await r.expire(fullKey, windowSeconds);
      return count <= limit;
    } catch (error) {
      console.error('[rate-limit] Redis nicht erreichbar, nutze Speicher im Prozess', error);
    }
  }
  const now = Date.now();
  const current = memoryHits.get(fullKey);
  if (!current || current.resetAt < now) {
    if (memoryHits.size > 10_000) memoryHits.clear();
    memoryHits.set(fullKey, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

/**
 * Gibt einen gezählten Versuch zurück (z. B. nach erfolgreicher Anmeldung),
 * damit viele Gäste hinter derselben IP (WLAN am Hochzeitsort) sich nicht
 * gegenseitig aussperren – es zählen effektiv nur Fehlversuche.
 */
export async function refundRateLimit(key: string): Promise<void> {
  const fullKey = `${PREFIX}:rl:${key}`;
  const r = redis();
  if (r) {
    try {
      const count = await r.decr(fullKey);
      if (count < 0) await r.set(fullKey, '0', { ex: 60 });
      return;
    } catch (error) {
      console.error('[rate-limit] Redis nicht erreichbar', error);
    }
  }
  const current = memoryHits.get(fullKey);
  if (current && current.count > 0) current.count -= 1;
}

/** IP-Adresse des Aufrufers aus den Proxy-Headern (Vercel setzt x-forwarded-for / x-real-ip). */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || 'unbekannt';
}

/**
 * Gemeinsame Limits, damit Formular und Direkt-Link dasselbe Kontingent teilen.
 * Gäste-Login: 10 FEHLversuche pro Minute (Erfolge werden per refundRateLimit
 * zurückgebucht) – am Hochzeitsort sitzen viele Gäste hinter derselben WLAN-IP.
 */
export const LIMITS = {
  guestLogin: { key: (ip: string) => `login:${ip}`, limit: 10, window: 60 },
  adminLogin: { key: (ip: string) => `admin-login:${ip}`, limit: 5, window: 300 },
  rsvp: { key: (ip: string) => `rsvp:${ip}`, limit: 10, window: 600 },
} as const;
