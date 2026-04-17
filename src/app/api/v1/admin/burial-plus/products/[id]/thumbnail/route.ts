import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BUCKET = 'yedamlife';
const BASE_URL =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, message: '파일이 없습니다.' },
      { status: 400 },
    );
  }

  const path = `burial/bp-products/${id}.webp`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (uploadError) {
    console.error('[Admin API] thumbnail upload error:', uploadError);
    return NextResponse.json(
      { success: false, message: '이미지 업로드에 실패했습니다.' },
      { status: 500 },
    );
  }

  const thumbnailUrl = `${BASE_URL}/${path}`;

  return NextResponse.json({ success: true, url: thumbnailUrl });
}
