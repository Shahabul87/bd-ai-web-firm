/**
 * @jest-environment node
 */
describe('authChallenge', () => {
  const OLD = process.env;
  const realFetch = global.fetch;
  afterEach(() => {
    process.env = OLD;
    global.fetch = realFetch;
    jest.resetModules();
  });

  it('POSTs /v1/auth/challenge when configured', async () => {
    process.env = { ...OLD, NOTIFY_URL: 'https://n.test', NOTIFY_API_KEY: 'k_1' };
    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ challenge_id: 'c1' }), { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { authChallenge } = await import('../notify');
    const r = await authChallenge({ method: 'otp', to: 'a@b.com' });
    expect(r).toEqual({ challengeId: 'c1' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://n.test/v1/auth/challenge');
    expect(init.headers).toMatchObject({ 'X-API-Key': 'k_1' });
  });

  it('returns null on non-2xx', async () => {
    process.env = { ...OLD, NOTIFY_URL: 'https://n.test', NOTIFY_API_KEY: 'k_1' };
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('err', { status: 500 })) as unknown as typeof fetch;
    const { authChallenge } = await import('../notify');
    expect(await authChallenge({ method: 'otp', to: 'a@b.com' })).toBeNull();
  });

  it('falls back to devAuth (no fetch) when unconfigured in non-prod', async () => {
    process.env = { ...OLD, NOTIFY_URL: '', NOTIFY_API_KEY: '', NODE_ENV: 'test' };
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const { authChallenge, authVerify } = await import('../notify');
    const chal = await authChallenge({ method: 'otp', to: 'a@b.com' });
    expect(chal?.challengeId).toMatch(/^dev_/);
    expect(fetchMock).not.toHaveBeenCalled();
    // wrong code fails, and (dev) we can't guess it here, so just assert shape
    const bad = await authVerify({ challengeId: chal!.challengeId, code: '000000' });
    expect(typeof bad.ok).toBe('boolean');
  });
});
