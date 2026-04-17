import { parseListParams, getList } from '@/lib/admin/api-helpers';

const TABLE = 'cf_consultation_requests';
const SEARCH_COLUMNS = ['name', 'phone', 'region'];

export async function GET(request: Request) {
  const params = parseListParams(request.url);
  return getList(TABLE, params, SEARCH_COLUMNS);
}
