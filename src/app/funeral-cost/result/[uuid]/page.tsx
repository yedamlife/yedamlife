import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { FuneralCostResultClient } from './client';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

interface EstimateApiResponse {
  success: boolean;
  data?: {
    uuid: string;
    name: string;
    funeralType: '3day' | 'nobinso';
    mode: 'live' | 'snapshot';
    inputJson?: Record<string, unknown>;
    resultJson?: Record<string, unknown>;
    consultedAt?: string;
    consultedProduct?: { id: string; name: string };
    createdAt: string;
  };
  error?: string;
  message?: string;
}

async function fetchEstimate(
  uuid: string,
): Promise<EstimateApiResponse['data'] | null> {
  const h = await headers();
  const host = h.get('host') ?? 'yedamlife.com';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const origin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN ?? `${protocol}://${host}`;

  try {
    const res = await fetch(
      `${origin}/api/v1/funeral-cost/estimate/${encodeURIComponent(uuid)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as EstimateApiResponse;
    if (!json.success || !json.data) return null;
    return json.data;
  } catch (e) {
    console.error('[funeral-cost/result] fetch failed', e);
    return null;
  }
}

export default async function FuneralCostResultPage({ params }: PageProps) {
  const { uuid } = await params;
  const data = await fetchEstimate(uuid);
  if (!data) notFound();
  return <FuneralCostResultClient data={data} />;
}
