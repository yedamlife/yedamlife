import { NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/admin/auth';
import { verifyGoogleIdToken } from '@/lib/admin/google';
import { supabase as supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    let body: { credential?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (!body.credential) {
      return NextResponse.json(
        { success: false, error: 'invalid_request', message: '인증 정보가 필요합니다.' },
        { status: 400 },
      );
    }

    // Google ID Token 검증 → admin_users 화이트리스트 확인
    let googleUser;
    try {
      googleUser = await verifyGoogleIdToken(body.credential);
    } catch {
      return NextResponse.json(
        { success: false, error: 'invalid_token', message: '인증 토큰이 유효하지 않습니다.' },
        { status: 401 },
      );
    }

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', googleUser.email)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'not_admin', message: '등록된 관리자 계정이 아닙니다.' },
        { status: 403 },
      );
    }

    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    const session = {
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      avatar_url: adminUser.avatar_url ?? googleUser.picture,
    };

    await setAdminSession(session);

    return NextResponse.json({ success: true, data: session });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
