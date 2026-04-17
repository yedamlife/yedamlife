import { parseListParams, getList } from '@/lib/admin/api-helpers';

const TABLE = 'corporate_proposal_requests';
const SEARCH_COLUMNS = ['name', 'phone', 'company_name', 'email'];

export async function GET(request: Request) {
  const params = parseListParams(request.url);
  return getList(TABLE, params, SEARCH_COLUMNS);
}
