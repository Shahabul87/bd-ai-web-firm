describe('isAdminEmail', () => {
  const OLD = process.env;
  afterEach(() => {
    process.env = OLD;
    jest.resetModules();
  });

  it('matches allowlisted emails case-insensitively', async () => {
    process.env = { ...OLD, ADMIN_EMAILS: 'Owner@Craftsai.org, a@b.com' };
    const { isAdminEmail } = await import('../adminAuth');
    expect(isAdminEmail('owner@craftsai.org')).toBe(true);
    expect(isAdminEmail('A@B.com')).toBe(true);
    expect(isAdminEmail('nope@x.com')).toBe(false);
  });

  it('returns false when unset', async () => {
    process.env = { ...OLD, ADMIN_EMAILS: '' };
    const { isAdminEmail } = await import('../adminAuth');
    expect(isAdminEmail('a@b.com')).toBe(false);
  });

  it('matches despite leading/trailing whitespace on the input', async () => {
    process.env = { ...OLD, ADMIN_EMAILS: 'owner@craftsai.org' };
    const { isAdminEmail } = await import('../adminAuth');
    expect(isAdminEmail('  Owner@CraftsAI.org  ')).toBe(true);
    expect(isAdminEmail('\towner@craftsai.org\n')).toBe(true);
  });

  it('parses a normalized, de-duplicated allowlist', async () => {
    process.env = { ...OLD, ADMIN_EMAILS: ' Owner@Craftsai.org , owner@craftsai.org, a@b.com ' };
    const { adminEmailList } = await import('../adminAuth');
    expect(adminEmailList()).toEqual(['owner@craftsai.org', 'a@b.com']);
  });
});
