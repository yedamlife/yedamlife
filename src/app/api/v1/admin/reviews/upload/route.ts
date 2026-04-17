import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BUCKET = 'yedamlife';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'validation_error', message: '파일이 필요합니다.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: 'validation_error', message: '파일 크기는 5MB 이하여야 합니다.' },
      { status: 400 },
    );
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { success: false, error: 'validation_error', message: '이미지 파일만 업로드 가능합니다.' },
      { status: 400 },
    );
  }

  const random = Math.random().toString(36).slice(2, 8);
  const filename = `review/${Date.now()}_${random}.webp`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: 'image/webp',
    upsert: false,
  });

  if (error) {
    console.error('[Admin API] review image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'upload_error', message: error.message },
      { status: 500 },
    );
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return NextResponse.json({ success: true, url: urlData.publicUrl });
}
