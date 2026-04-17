import { parseListParams, getList } from '@/lib/admin/api-helpers';

const TABLE = 'pc_consultation_requests';
const SEARCH_COLUMNS = ['name', 'phone', 'service_type'];

export async function GET(request: Request) {
  const params = parseListParams(request.url);
  return getList(TABLE, params, SEARCH_COLUMNS);
}
