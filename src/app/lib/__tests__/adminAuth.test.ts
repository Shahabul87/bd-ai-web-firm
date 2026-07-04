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
});
