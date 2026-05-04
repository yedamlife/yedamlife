import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const normalizePhone = (raw: string) => raw.replace(/[^0-9]/g, '');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || '').trim();
    const phone = normalizePhone(searchParams.get('phone') || '');

    if (!phone || (type !== 'general' && type !== 'corporate')) {
      return NextResponse.json(
        { success: false, error: 'validation_error', message: '필수 항목이 누락되었습니다.' },
        { status: 400 },
      );
    }

    if (type === 'general') {
      const name = (searchParams.get('name') || '').trim();
      if (!name) {
        return NextResponse.json(
          { success: false, error: 'validation_error', message: '이름이 필요합니다.' },
          { status: 400 },
        );
      }

      const { data } = await supabase
        .from('gf_membership_applications')
        .select('id, uuid, name, phone, status')
        .eq('name', name)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      const match = data?.find((r) => normalizePhone(r.phone || '') === phone);
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'not_found', message: '가입 신청 내역이 없습니다.' },
          { status: 404 },
        );
      }
      if (match.status !== 'completed') {
        return NextResponse.json(
          {
            success: false,
            error: 'pending',
            message: '현재 접수 상태입니다.',
            data: { status: match.status ?? 'pending' },
          },
          { status: 200 },
        );
      }
      return NextResponse.json({
        success: true,
        data: { id: match.uuid, membership_type: 'general' },
      });
    }

    // type === 'corporate'
    const companyName = (searchParams.get('company_name') || '').trim();
    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'validation_error', message: '기업명이 필요합니다.' },
        { status: 400 },
      );
    }

    const { data } = await supabase
      .from('cf_membership_applications')
      .select('id, uuid, company_name, phone, status')
      .ilike('company_name', `%${companyName}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const match = data?.find((r) => normalizePhone(r.phone || '') === phone);
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '가입 신청 내역이 없습니다.' },
        { status: 404 },
      );
    }
    if (match.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'pending',
          message: '현재 접수 상태입니다.',
          data: { status: match.status ?? 'pending' },
        },
        { status: 200 },
      );
    }
    return NextResponse.json({
      success: true,
      data: { id: match.uuid, membership_type: 'corporate' },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
