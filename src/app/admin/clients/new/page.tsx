import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import AdminNav from '../../AdminNav';
import NewClientForm from '../NewClientForm';

export const metadata = { title: 'New client', robots: { index: false, follow: false } };

export default async function NewClientPage() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/admin/clients" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal">
          ← All clients
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium">New client</h1>
        <div className="mt-8">
          <NewClientForm />
        </div>
      </main>
    </>
  );
}
