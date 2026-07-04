import { auth } from '@/auth';
import { isAdminEmail } from './adminAuth';

/**
 * Server-side admin gate. Returns the admin identity only when there is a
 * valid session AND the email is still on the allowlist (re-checked every call,
 * so removing someone from ADMIN_EMAILS revokes access immediately).
 */
export async function getAdmin(): Promise<{ email: string } | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isAdminEmail(email)) return null;
  return { email };
}
