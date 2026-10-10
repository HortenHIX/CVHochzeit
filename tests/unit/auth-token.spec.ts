import { expect, test } from '@playwright/test';
import {
  createSessionToken,
  normalizeGuestCode,
  roleForCode,
  safeRedirectPath,
  SESSION_MAX_AGE,
  signValue,
  verifySessionToken,
  verifySignedValue,
  type AuthSecrets,
} from '../../src/lib/auth/token';

const secrets: AuthSecrets = { guestCode: 'Sonne-24', adminCode: 'geheimes-admin', sessionSecret: 'pepper' };
const now = 1_800_000_000;

test.describe('Session-Tokens', () => {
  test('gültiges Token ergibt die Rolle', async () => {
    const guest = await createSessionToken('guest', secrets, now);
    const admin = await createSessionToken('admin', secrets, now);
    expect(await verifySessionToken(guest, secrets, now + 10)).toBe('guest');
    expect(await verifySessionToken(admin, secrets, now + 10)).toBe('admin');
  });

  test('manipulierte Tokens werden abgelehnt', async () => {
    const guest = (await createSessionToken('guest', secrets, now))!;
    const [, iat, sig] = guest.split('.');
    expect(await verifySessionToken(`admin.${iat}.${sig}`, secrets, now)).toBeNull();
    expect(await verifySessionToken(`guest.${Number(iat) + 1}.${sig}`, secrets, now)).toBeNull();
    expect(await verifySessionToken(`${guest}x`, secrets, now)).toBeNull();
    expect(await verifySessionToken('guest.abc.def', secrets, now)).toBeNull();
    expect(await verifySessionToken('', secrets, now)).toBeNull();
    expect(await verifySessionToken(undefined, secrets, now)).toBeNull();
  });

  test('abgelaufene und zukünftige Tokens werden abgelehnt', async () => {
    const guest = await createSessionToken('guest', secrets, now);
    expect(await verifySessionToken(guest, secrets, now + SESSION_MAX_AGE.guest + 1)).toBeNull();
    const future = await createSessionToken('guest', secrets, now + 3600);
    expect(await verifySessionToken(future, secrets, now)).toBeNull();
  });

  test('Code-Wechsel macht alte Sessions ungültig', async () => {
    const guest = await createSessionToken('guest', secrets, now);
    const admin = await createSessionToken('admin', secrets, now);
    expect(await verifySessionToken(guest, { ...secrets, guestCode: 'neu' }, now)).toBeNull();
    expect(await verifySessionToken(admin, { ...secrets, adminCode: 'neu' }, now)).toBeNull();
    // Gästecode-Wechsel lässt Admin-Sessions unberührt
    expect(await verifySessionToken(admin, { ...secrets, guestCode: 'neu' }, now)).toBe('admin');
  });

  test('ohne Code keine Tokens', async () => {
    expect(await createSessionToken('admin', { ...secrets, adminCode: null }, now)).toBeNull();
    const admin = await createSessionToken('admin', secrets, now);
    expect(await verifySessionToken(admin, { ...secrets, adminCode: null }, now)).toBeNull();
  });

  test('Secret-Wechsel macht alle Sessions ungültig', async () => {
    const guest = await createSessionToken('guest', secrets, now);
    expect(await verifySessionToken(guest, { ...secrets, sessionSecret: 'anders' }, now)).toBeNull();
  });
});

test.describe('Codes', () => {
  test('Gästecode tolerant: Groß/klein, Leerzeichen, Bindestriche', () => {
    expect(normalizeGuestCode(' sonne 24 ')).toBe(normalizeGuestCode('SONNE-24'));
    expect(roleForCode('sonne24', secrets)).toBe('guest');
    expect(roleForCode('  SONNE – 24 ', secrets)).toBe('guest');
    expect(roleForCode('sonne25', secrets)).toBeNull();
    expect(roleForCode('', secrets)).toBeNull();
  });

  test('Admin-Passwort exakt (nur Leerzeichen am Rand egal)', () => {
    expect(roleForCode('geheimes-admin', secrets)).toBe('admin');
    expect(roleForCode(' geheimes-admin ', secrets)).toBe('admin');
    expect(roleForCode('GEHEIMES-ADMIN', secrets)).toBeNull();
  });
});

test.describe('Signierte Werte', () => {
  test('Signatur wird geprüft', async () => {
    const signed = await signValue('abc-123', 'rsvp', secrets);
    expect(await verifySignedValue(signed, 'rsvp', secrets)).toBe('abc-123');
    expect(await verifySignedValue(signed, 'anderer-zweck', secrets)).toBeNull();
    expect(await verifySignedValue(signed.replace('abc', 'abd'), 'rsvp', secrets)).toBeNull();
    expect(await verifySignedValue('abc-123', 'rsvp', secrets)).toBeNull();
  });
});

test.describe('Weiterleitungsziele', () => {
  test('nur relative Pfade', () => {
    expect(safeRedirectPath('/fotos/karte')).toBe('/fotos/karte');
    expect(safeRedirectPath('/?x=1#zusage')).toBe('/?x=1#zusage');
    expect(safeRedirectPath('https://evil.example')).toBe('/');
    expect(safeRedirectPath('//evil.example')).toBe('/');
    expect(safeRedirectPath('/\\evil.example')).toBe('/');
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/');
    expect(safeRedirectPath(null)).toBe('/');
  });
});
