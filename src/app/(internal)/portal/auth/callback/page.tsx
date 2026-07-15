import PortalLoginFlow from '../../login/PortalLoginFlow';

export const metadata = { title: 'Client sign in | CraftsAI', robots: { index: false, follow: false } };

export default async function PortalAuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PortalLoginFlow initialToken={token} />;
}
