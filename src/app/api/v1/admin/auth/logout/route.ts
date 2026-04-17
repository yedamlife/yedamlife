import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin/auth';

export async function POST() {
  try {
    await clearAdminSession();
    return NextResponse.json({ success: true, message: '로그아웃 되었습니다.' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
