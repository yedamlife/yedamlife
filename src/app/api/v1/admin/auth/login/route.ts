import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { setAdminSession, isLocalhost, DEV_ADMIN } from '@/lib/admin/auth';

export async function POST() {
  try {
    const headersList = await headers();
    const host = headersList.get('host');

    // localhost에서만 dev 로그인 허용
    if (!isLocalhost(host)) {
      return NextResponse.json(
        { success: false, error: 'forbidden', message: '이 환경에서는 사용할 수 없습니다.' },
        { status: 403 },
      );
    }

    await setAdminSession(DEV_ADMIN);

    return NextResponse.json({ success: true, data: DEV_ADMIN });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
