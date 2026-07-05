import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { listIncidents, countIncidents, type IncidentRow } from '@/app/lib/report';
import AdminNav from '../AdminNav';

export const metadata = { title: 'Incidents', robots: { index: false, follow: false } };

function fmt(d: Date): string {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SeverityBadge({ severity }: { severity: 'WARN' | 'ERROR' }) {
  const isError = severity === 'ERROR';
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
        isError ? 'border-red-500/40 text-red-300' : 'border-amber/40 text-amber'
      }`}
    >
      {severity}
    </span>
  );
}

// Incidents can carry a small meta object; render it compactly and safely.
function metaPreview(meta: unknown): string {
  if (meta == null) return '';
  try {
    const s = JSON.stringify(meta);
    return s.length > 120 ? `${s.slice(0, 117)}…` : s;
  } catch {
    return '';
  }
}

export default async function AdminIncidents() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  // The Incident table may not exist yet (before the migration is applied in an
  // environment); degrade to an empty list rather than 500-ing the dashboard.
  let incidents: IncidentRow[] = [];
  let errorCount = 0;
  let available = true;
  try {
    [incidents, errorCount] = await Promise.all([
      listIncidents({ take: 200 }),
      countIncidents({ severity: 'ERROR' }),
    ]);
  } catch {
    available = false;
  }

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Observability</p>
            <h1 className="mt-2 font-display text-3xl font-medium">
              {available ? (
                <>
                  {incidents.length} recent{' '}
                  <span className="text-steel">·</span>{' '}
                  <span className="text-red-300">{errorCount} errors</span>
                </>
              ) : (
                'Incidents'
              )}
            </h1>
          </div>
        </div>

        {!available ? (
          <div className="mt-8 border border-line bg-ink-900 px-4 py-12 text-center text-steel">
            The incident log is not available yet. Apply the latest database
            migration (<span className="font-mono text-bone">npm run db:deploy</span>) to enable it.
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-ink-900 font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Meta</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-steel">
                      No incidents recorded. Quiet is good.
                    </td>
                  </tr>
                )}
                {incidents.map((i) => (
                  <tr key={i.id} className="border-b border-line/60 align-top transition-colors hover:bg-ink-900">
                    <td className="whitespace-nowrap px-4 py-3 text-steel">{fmt(i.createdAt)}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={i.severity} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] tracking-[0.05em] text-bone">
                      {i.scope}
                    </td>
                    <td className="px-4 py-3 text-steel">{i.message}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-steel/80">{metaPreview(i.meta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
