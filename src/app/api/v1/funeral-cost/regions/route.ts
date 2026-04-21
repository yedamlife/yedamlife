import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'sido') {
      const { data, error } = await supabase
        .from('funeral_halls')
        .select('sido_cd, org_name');

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      const sidoMap = new Map<string, string>();
      for (const row of data ?? []) {
        if (!sidoMap.has(row.sido_cd)) {
          const sidoName = row.org_name.split(' ')[0];
          sidoMap.set(row.sido_cd, sidoName);
        }
      }

      const result = Array.from(sidoMap.entries()).map(([code, name]) => ({
        code,
        name,
      }));

      return NextResponse.json({ success: true, data: result });
    }

    if (type === 'gungu') {
      const sido = searchParams.get('sido');

      if (!sido) {
        return NextResponse.json(
          { success: false, error: 'sido parameter is required' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('funeral_halls')
        .select('gungu_cd, org_name')
        .eq('sido_cd', sido);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      const gunguMap = new Map<string, string>();
      for (const row of data ?? []) {
        if (!gunguMap.has(row.gungu_cd)) {
          gunguMap.set(row.gungu_cd, row.org_name);
        }
      }

      const result = Array.from(gunguMap.entries()).map(([code, name]) => ({
        code,
        name,
      }));

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter. Use "sido" or "gungu".' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
