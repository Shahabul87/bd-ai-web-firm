import Link from 'next/link';
import { signOutPortal } from './login/actions';
import EnablePush from '@/app/components/EnablePush';

/** Portal header for authenticated pages (distinct from the admin nav). */
export default function PortalHeader({ clientName }: { clientName: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/portal" className="font-mono text-sm font-semibold tracking-tight text-bone">
            CRAFTS.AI<span className="text-signal">▮</span> <span className="text-steel">CLIENT</span>
          </Link>
          <Link href="/portal" className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:text-signal">
            Projects
          </Link>
          <Link href="/portal/invoices" className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors hover:text-signal">
            Invoices
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <EnablePush registerPath="/api/user/push/register" />
          <span className="hidden font-mono text-xs uppercase tracking-[0.1em] text-steel sm:inline">
            {clientName}
          </span>
          <form action={signOutPortal}>
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
