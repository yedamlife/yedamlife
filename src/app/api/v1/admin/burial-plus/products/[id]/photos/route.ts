import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabase } from '@/lib/supabase';

const BUCKET = 'yedamlife';
const BASE_URL =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const formData = await request.formData();
  const files = formData.getAll('files').filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { success: false, message: '파일이 없습니다.' },
      { status: 400 },
    );
  }

  const urls: string[] = [];
  const errors: { name: string; message: string }[] = [];

  await Promise.all(
    files.map(async (file) => {
      try {
        const path = `burial/bp-products/photos/${id}/${randomUUID()}.webp`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
          contentType: 'image/webp',
          upsert: false,
        });
        if (error) {
          errors.push({ name: file.name, message: error.message });
          return;
        }
        urls.push(`${BASE_URL}/${path}`);
      } catch (e) {
        errors.push({
          name: file.name,
          message: e instanceof Error ? e.message : 'unknown',
        });
      }
    }),
  );

  if (urls.length === 0) {
    console.error('[Admin API] bp-products photos upload failed:', errors);
    return NextResponse.json(
      { success: false, message: '이미지 업로드에 실패했습니다.', errors },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, urls, errors });
}
