import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/app/lib/adminSession';
import {
  listLeads,
  leadsToCsv,
  type LeadStatusValue,
  type LeadSourceValue,
} from '@/app/lib/leads';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const rows = await listLeads({
    status: (sp.get('status') as LeadStatusValue) || undefined,
    source: (sp.get('source') as LeadSourceValue) || undefined,
    q: sp.get('q') || undefined,
    take: 5000,
  });

  return new NextResponse(leadsToCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="craftsai-leads.csv"',
    },
  });
}
