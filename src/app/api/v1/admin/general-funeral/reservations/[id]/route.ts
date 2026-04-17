import { getDetail, updateRecord, deleteRecord } from '@/lib/admin/api-helpers';

const TABLE = 'gf_direct_requests';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getDetail(TABLE, id);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return updateRecord(TABLE, id, body);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteRecord(TABLE, id);
}
