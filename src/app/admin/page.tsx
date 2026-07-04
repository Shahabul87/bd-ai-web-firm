import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { signOutAction } from './login/actions';

export default async function AdminHome() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Admin</p>
      <h1 className="mt-4 font-display text-4xl font-medium">Signed in.</h1>
      <p className="mt-3 text-steel">
        Welcome, {admin.email}. The leads dashboard arrives in the next phase.
      </p>
      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
