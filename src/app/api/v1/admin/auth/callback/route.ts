import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { supabase as supabaseAdmin } from '@/lib/supabase';
import { setAdminSession } from '@/lib/admin/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=no_code`);
  }

  try {
    const supabase = await createSupabaseServer();
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !authData.user?.email) {
      return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
    }

    // admin_users 테이블에서 관리자 확인
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', authData.user.email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/login?error=not_admin`);
    }

    // last_login 업데이트
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    await setAdminSession({
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      avatar_url: adminUser.avatar_url,
    });

    return NextResponse.redirect(`${origin}/admin/dashboard`);
  } catch {
    return NextResponse.redirect(`${origin}/admin/login?error=unknown`);
  }
}
