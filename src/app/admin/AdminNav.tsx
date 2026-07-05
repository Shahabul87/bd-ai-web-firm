import Link from 'next/link';
import { signOutAction } from './login/actions';

export default function AdminNav({ email }: { email: string }) {
  return (
    <header className="border-b border-line bg-ink-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-mono text-sm font-bold tracking-[0.1em] text-bone">
            CRAFTS.AI<span className="text-signal">▮</span> ADMIN
          </Link>
          <Link
            href="/admin"
            className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:text-signal"
          >
            Leads
          </Link>
          <Link
            href="/admin/clients"
            className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:text-signal"
          >
            Clients
          </Link>
          <Link
            href="/admin/invoices"
            className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:text-signal"
          >
            Invoices
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-steel sm:inline">{email}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
