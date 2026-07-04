import LoginFlow from '../LoginFlow';

export const metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default async function AdminLoginCallback({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <LoginFlow initialToken={token} />;
}
