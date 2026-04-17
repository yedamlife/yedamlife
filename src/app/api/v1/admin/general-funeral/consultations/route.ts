import { parseListParams, getList } from '@/lib/admin/api-helpers';

const TABLE = 'gf_consultation_requests';
const SEARCH_COLUMNS = ['contact_number', 'funeral_location'];

export async function GET(request: Request) {
  const params = parseListParams(request.url);
  return getList(TABLE, params, SEARCH_COLUMNS);
}
