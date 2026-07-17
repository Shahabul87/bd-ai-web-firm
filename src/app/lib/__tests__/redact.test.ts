import { redactMeta, maskEmail } from '../redact';

/**
 * Phase 3 Task 3.5 — "Redact personal data and secrets from logs and incident
 * metadata." Enforced at the sink because Incident.meta is written by many
 * callers; a single `meta: { token }` would otherwise persist auth material.
 */
describe('redactMeta — secrets', () => {
  it.each([
    'token',
    'accessToken',
    'apiKey',
    'api_key',
    'password',
    'secret',
    'authorization',
    'cookie',
    'otp',
    'recoveryCode',
    'ticket',
  ])('redacts the value of %s', (key) => {
    const out = redactMeta({ [key]: 'super-sensitive-value' })!;
    expect(out[key]).toBe('[redacted]');
    expect(JSON.stringify(out)).not.toContain('super-sensitive-value');
  });

  it('redacts secrets nested inside objects and arrays', () => {
    const out = redactMeta({ outer: { inner: { token: 'leak-me' } }, list: [{ password: 'leak-me' }] })!;
    expect(JSON.stringify(out)).not.toContain('leak-me');
  });

  it('keeps ordinary diagnostic fields intact', () => {
    const out = redactMeta({ scope: 'invoice.send', attempts: 3, ok: false })!;
    expect(out).toEqual({ scope: 'invoice.send', attempts: 3, ok: false });
  });
});

describe('redactMeta — personal data', () => {
  it('masks email addresses rather than storing them whole', () => {
    const out = redactMeta({ email: 'ada.lovelace@example.com' })!;
    expect(out.email).toBe('a***@example.com');
  });

  it('masks actorEmail and recipient too', () => {
    const out = redactMeta({ actorEmail: 'admin@x.com', to: 'client@y.com' })!;
    expect(out.actorEmail).toBe('a***@x.com');
    expect(out.to).toBe('c***@y.com');
  });

  it('redacts a phone number entirely', () => {
    const out = redactMeta({ phone: '+8801700000000' })!;
    expect(out.phone).toBe('[redacted-pii]');
  });
});

describe('redactMeta — bounds', () => {
  it('truncates a huge string so one incident cannot bloat the table', () => {
    const out = redactMeta({ blob: 'x'.repeat(5000) })!;
    expect((out.blob as string).length).toBeLessThan(600);
  });

  it('stops at a depth limit rather than recursing forever', () => {
    type Deep = { next?: Deep };
    const deep: Deep = {};
    let cursor = deep;
    for (let i = 0; i < 50; i++) {
      cursor.next = {};
      cursor = cursor.next;
    }
    expect(() => redactMeta(deep as Record<string, unknown>)).not.toThrow();
    expect(JSON.stringify(redactMeta(deep as Record<string, unknown>))).toContain('depth-limit');
  });

  it('passes undefined through', () => {
    expect(redactMeta(undefined)).toBeUndefined();
  });
});

describe('maskEmail', () => {
  it('keeps the domain for triage but hides the local part', () => {
    expect(maskEmail('bob@craftsai.org')).toBe('b***@craftsai.org');
  });

  it('fully masks a value that is not an email', () => {
    expect(maskEmail('not-an-email')).toBe('***');
  });
});
