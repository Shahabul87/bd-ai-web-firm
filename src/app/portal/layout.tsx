export const metadata = { robots: { index: false, follow: false } };

/** Portal shell. Individual pages render <PortalHeader> after gating with
 *  getPortalClient(); the login/callback pages render without it. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink-950 text-bone">{children}</div>;
}
