/** @jest-environment node */

const fetchMock = jest.fn();

beforeEach(() => {
  jest.resetModules();
  process.env.NOTIFY_URL = 'https://notify.example';
  process.env.NOTIFY_API_KEY = 'k';
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 202, json: async () => ({}), text: async () => '' });
});

it('sendPush posts channel push to user ref', async () => {
  const { sendPush } = require('../notify');
  await sendPush('admin', 'New lead', 'Ada / ada@x.com');
  const [url, opts] = fetchMock.mock.calls[0];
  expect(String(url)).toContain('/v1/notify');
  const body = JSON.parse(opts.body);
  expect(body.channel).toBe('push');
  expect(body.to).toBe('user:admin');
  expect(body.template).toBe('announcement');
  expect(body.data).toEqual(expect.objectContaining({ subject: 'New lead', body: 'Ada / ada@x.com' }));
});

it('registerDevice posts token to /v1/devices', async () => {
  const { registerDevice } = require('../notify');
  await registerDevice('tok123', 'client:c1');
  const [url, opts] = fetchMock.mock.calls[0];
  expect(String(url)).toContain('/v1/devices');
  expect(JSON.parse(opts.body)).toEqual(
    expect.objectContaining({ token: 'tok123', user_ref: 'client:c1', platform: 'web' }),
  );
});

it('no-op when notify unconfigured', async () => {
  process.env.NOTIFY_URL = '';
  process.env.NOTIFY_API_KEY = '';
  jest.resetModules();
  const { sendPush, registerDevice } = require('../notify');
  await sendPush('admin', 's', 'b');
  await registerDevice('t', 'admin');
  expect(fetchMock).not.toHaveBeenCalled();
});
