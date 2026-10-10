import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Redis } from '@upstash/redis';
import type { RsvpEntry } from '@/lib/rsvp/types';

/**
 * Speicher für Rückmeldungen.
 *
 * - Produktion (Vercel): Upstash Redis aus dem Vercel Marketplace. Die
 *   Integration setzt automatisch KV_REST_API_URL / KV_REST_API_TOKEN
 *   (alternativ werden UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN gelesen).
 * - Lokal (`npm run dev`) oder mit RSVP_STORAGE=file: JSON-Datei in `.data/`.
 */

const PREFIX = 'cvhochzeit';
const RSVP_HASH = `${PREFIX}:rsvps`;
const FILE_PATH = process.env.RSVP_FILE || path.join(process.cwd(), '.data', 'rsvps.json');

export type StorageKind = 'redis' | 'file' | 'none';

export function storageKind(): StorageKind {
  if (redisConfig()) return 'redis';
  if (process.env.NODE_ENV === 'development' || process.env.RSVP_STORAGE === 'file') return 'file';
  return 'none';
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Kein Speicher konfiguriert (Upstash Redis fehlt).');
    this.name = 'StorageNotConfiguredError';
  }
}

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

let redisClient: Redis | null = null;
function redis(): Redis {
  const config = redisConfig();
  if (!config) throw new StorageNotConfiguredError();
  redisClient ??= new Redis({ ...config, automaticDeserialization: false });
  return redisClient;
}

/* ---------------------------------------------------------------------------
 * Datei-Speicher (nur lokal)
 * ------------------------------------------------------------------------- */

let fileQueue: Promise<unknown> = Promise.resolve();

async function readFileStore(): Promise<Record<string, RsvpEntry>> {
  try {
    return JSON.parse(await fs.readFile(FILE_PATH, 'utf8')) as Record<string, RsvpEntry>;
  } catch {
    return {};
  }
}

/** Schreibzugriffe nacheinander ausführen, damit sich nichts überschreibt. */
function withFileStore<T>(fn: (store: Record<string, RsvpEntry>) => T | Promise<T>): Promise<T> {
  const run = fileQueue.then(async () => {
    const store = await readFileStore();
    const result = await fn(store);
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    const tmp = `${FILE_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(tmp, FILE_PATH);
    return result;
  });
  fileQueue = run.catch(() => undefined);
  return run;
}

function parseEntry(raw: unknown): RsvpEntry | null {
  if (!raw) return null;
  try {
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as RsvpEntry;
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * Öffentliche API
 * ------------------------------------------------------------------------- */

export async function saveRsvp(entry: RsvpEntry): Promise<void> {
  const kind = storageKind();
  if (kind === 'redis') {
    await redis().hset(RSVP_HASH, { [entry.id]: JSON.stringify(entry) });
    return;
  }
  if (kind === 'file') {
    await withFileStore((store) => {
      store[entry.id] = entry;
    });
    return;
  }
  throw new StorageNotConfiguredError();
}

export async function getRsvp(id: string): Promise<RsvpEntry | null> {
  const kind = storageKind();
  if (kind === 'redis') return parseEntry(await redis().hget<string>(RSVP_HASH, id));
  if (kind === 'file') return (await readFileStore())[id] ?? null;
  throw new StorageNotConfiguredError();
}

/** Alle Rückmeldungen, neueste zuerst. */
export async function listRsvps(): Promise<RsvpEntry[]> {
  const kind = storageKind();
  let entries: RsvpEntry[];
  if (kind === 'redis') {
    const all = (await redis().hgetall<Record<string, string>>(RSVP_HASH)) ?? {};
    entries = Object.values(all)
      .map(parseEntry)
      .filter((e): e is RsvpEntry => e !== null);
  } else if (kind === 'file') {
    entries = Object.values(await readFileStore());
  } else {
    throw new StorageNotConfiguredError();
  }
  return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteRsvp(id: string): Promise<void> {
  const kind = storageKind();
  if (kind === 'redis') {
    await redis().hdel(RSVP_HASH, id);
    return;
  }
  if (kind === 'file') {
    await withFileStore((store) => {
      delete store[id];
    });
    return;
  }
  throw new StorageNotConfiguredError();
}

/* ---------------------------------------------------------------------------
 * Einfache Begrenzung von Anfragen (z. B. Login-Versuche)
 * ------------------------------------------------------------------------- */

const memoryHits = new Map<string, { count: number; resetAt: number }>();

/**
 * Zählt einen Versuch für `key`. Gibt `false` zurück, wenn im Zeitfenster
 * mehr als `limit` Versuche stattgefunden haben.
 */
export async function hitRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const fullKey = `${PREFIX}:rl:${key}`;
  if (storageKind() === 'redis') {
    try {
      const count = await redis().incr(fullKey);
      if (count === 1) await redis().expire(fullKey, windowSeconds);
      return count <= limit;
    } catch (error) {
      console.error('[rate-limit] Redis nicht erreichbar, nutze Speicher im Prozess', error);
    }
  }
  const now = Date.now();
  const current = memoryHits.get(fullKey);
  if (!current || current.resetAt < now) {
    memoryHits.set(fullKey, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
