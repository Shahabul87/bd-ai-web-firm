describe('pushConfig', () => {
  const OLD = process.env;
  afterEach(() => {
    process.env = OLD;
  });

  function loadWith(env: Record<string, string | undefined>) {
    jest.resetModules();
    process.env = { ...OLD, ...env };
    return require('../pushConfig');
  }

  it('isPushConfigured false when vars missing', () => {
    const m = loadWith({
      NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: undefined,
    });
    expect(m.isPushConfigured()).toBe(false);
    expect(m.firebaseWebConfig()).toBeNull();
  });

  it('isPushConfigured false when web config present but VAPID missing', () => {
    const m = loadWith({
      NEXT_PUBLIC_FIREBASE_API_KEY: 'k',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'd',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'p',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 's',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'a',
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: undefined,
    });
    expect(m.firebaseWebConfig()).not.toBeNull();
    expect(m.isPushConfigured()).toBe(false);
  });

  it('isPushConfigured true when all present', () => {
    const m = loadWith({
      NEXT_PUBLIC_FIREBASE_API_KEY: 'k',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'd',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'p',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 's',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'a',
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: 'v',
    });
    expect(m.isPushConfigured()).toBe(true);
    expect(m.firebaseWebConfig()).toEqual({
      apiKey: 'k',
      authDomain: 'd',
      projectId: 'p',
      messagingSenderId: 's',
      appId: 'a',
    });
    expect(m.vapidKey()).toBe('v');
  });
});
