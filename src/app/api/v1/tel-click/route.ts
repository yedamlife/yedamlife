import { NextResponse } from 'next/server';
import { sendAlimtalk } from '@/lib/alimtalk';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone ?? '').trim();
    const category = String(body.category ?? '').trim();
    const url = String(body.url ?? '').trim();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'validation_error', message: 'phone 누락' },
        { status: 400 },
      );
    }

    const now = new Date();
    const 접수일시 =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const host = request.headers.get('host');
    const isLocal =
      process.env.NODE_ENV !== 'production' ||
      (host?.startsWith('localhost') ?? false) ||
      (host?.startsWith('127.0.0.1') ?? false);

    const sendPromise = sendAlimtalk(
      'TEL_CALL',
      {
        경로: category || '예담라이프',
        URL: url,
        전화번호: phone,
        접수일시,
      },
      { host },
    );

    // localhost: 응답 전에 발송 완료를 보장 (dev 서버 idle / 함수 종료로 인한 누락 방지)
    if (isLocal) {
      await sendPromise.catch(() => {});
    } else {
      sendPromise.catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error' },
      { status: 500 },
    );
  }
}
