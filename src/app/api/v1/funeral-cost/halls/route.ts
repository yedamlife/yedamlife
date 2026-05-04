import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gungu = searchParams.get('gungu');
  const search = searchParams.get('search');

  if (!gungu) {
    return NextResponse.json(
      { success: false, error: 'gungu parameter is required' },
      { status: 400 }
    );
  }

  try {
    let query = supabase
      .from('funeral_halls')
      .select(
        'facility_cd, company_name, funeral_type, public_label, manage_class, mortuary_count, parking_count, full_address, facility_fees, service_items, sido_cd'
      )
      .eq('gungu_cd', gungu)
      .is('deleted_at', null)
      .order('mortuary_count', { ascending: false });

    if (search) {
      query = query.ilike('company_name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
