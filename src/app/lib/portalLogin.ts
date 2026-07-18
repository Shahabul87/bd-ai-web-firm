import { authChallenge } from './notify';
import { SITE_URL } from './email';
import { resolvePortalClient } from './portalIdentity';

/**
 * The invite gate + challenge dispatch, factored out of the route so it is unit
 * testable. Returns the challenge to store in the cookie, or null when the email
 * is not an ACTIVE, portalEnabled client (in which case NO email is sent — the
 * route still responds identically for enumeration safety).
 */
export async function startPortalLogin(
  email: string,
  method: 'otp' | 'magic_link',
): Promise<{ challengeId: string; email: string } | null> {
  // Resolves to exactly one active, portal-enabled client or nothing — so the
  // invite gate and the session (authPortal) can never disagree about identity.
  const client = await resolvePortalClient(email);
  if (!client) return null; // invite gate: not enabled → send nothing
  const chal = await authChallenge({
    method,
    to: email,
    name: client.name,
    redirect: `${SITE_URL}/portal/auth/callback`,
  });
  if (!chal) return null;
  return { challengeId: chal.challengeId, email };
}
