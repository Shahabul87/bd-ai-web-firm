/**
 * @jest-environment node
 */
describe('sendAnnouncement', () => {
  const OLD = process.env;
  const realFetch = global.fetch;
  afterEach(() => {
    process.env = OLD;
    global.fetch = realFetch;
    jest.resetModules();
  });

  it('no-ops (ok:false) when unconfigured, does not fetch', async () => {
    process.env = { ...OLD, NOTIFY_URL: '', NOTIFY_API_KEY: '' };
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const { sendAnnouncement } = await import('../notify');
    const r = await sendAnnouncement('a@b.com', 'S', 'B');
    expect(r.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs the announcement template with the API key header when configured', async () => {
    process.env = { ...OLD, NOTIFY_URL: 'https://n.test', NOTIFY_API_KEY: 'k_1' };
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message_id: 'm1', status: 'queued' }), { status: 202 }),
      );
    global.fetch = fetchMock as unknown as typeof fetch;
    const { sendAnnouncement } = await import('../notify');
    const r = await sendAnnouncement('a@b.com', 'New lead', 'Body');
    expect(r.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://n.test/v1/notify');
    expect(init.headers).toMatchObject({ 'X-API-Key': 'k_1' });
    const sent = JSON.parse(init.body as string);
    expect(sent).toMatchObject({ channel: 'email', to: 'a@b.com', template: 'announcement' });
    expect(sent.data).toMatchObject({ subject: 'New lead', title: 'New lead', body: 'Body' });
  });

  it('returns ok:false (no throw) on non-2xx', async () => {
    process.env = { ...OLD, NOTIFY_URL: 'https://n.test', NOTIFY_API_KEY: 'k_1' };
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('nope', { status: 500 })) as unknown as typeof fetch;
    const { sendAnnouncement } = await import('../notify');
    const r = await sendAnnouncement('a@b.com', 'S', 'B');
    expect(r.ok).toBe(false);
  });
});
