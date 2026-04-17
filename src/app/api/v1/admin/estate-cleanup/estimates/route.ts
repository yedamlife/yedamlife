import { parseListParams, getList } from '@/lib/admin/api-helpers';

const TABLE = 'ec_estimate_requests';
const SEARCH_COLUMNS = ['name', 'phone', 'address'];

export async function GET(request: Request) {
  const params = parseListParams(request.url);
  return getList(TABLE, params, SEARCH_COLUMNS);
}
