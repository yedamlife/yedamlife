import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const normalizePhone = (raw: string) => raw.replace(/[^0-9]/g, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'phone', 'zonecode', 'address'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: '필수 항목을 입력해주세요.',
          details: missing.map((field) => ({
            field,
            message: `${field}을(를) 입력해주세요.`,
          })),
        },
        { status: 400 },
      );
    }

    const phoneNorm = normalizePhone(body.phone);

    // 가입 내역 매칭 (general → corporate 순)
    let membershipType: 'general' | 'corporate' | null = null;
    let membershipId: string | null = null;
    let matchedMemberNo: string | null = null;

    const gf = await supabase
      .from('gf_membership_applications')
      .select('id, membership_no, phone')
      .eq('name', body.name)
      .order('created_at', { ascending: false });

    const gfMatch = gf.data?.find((r) => normalizePhone(r.phone || '') === phoneNorm);
    if (gfMatch) {
      membershipType = 'general';
      membershipId = gfMatch.id;
      matchedMemberNo = gfMatch.membership_no;
    } else {
      const cf = await supabase
        .from('cf_membership_applications')
        .select('id, membership_no, phone')
        .eq('name', body.name)
        .order('created_at', { ascending: false });

      const cfMatch = cf.data?.find((r) => normalizePhone(r.phone || '') === phoneNorm);
      if (cfMatch) {
        membershipType = 'corporate';
        membershipId = cfMatch.id;
        matchedMemberNo = cfMatch.membership_no;
      }
    }

    const { data, error } = await supabase
      .from('membership_card_requests')
      .insert({
        member_no: body.member_no || matchedMemberNo,
        name: body.name,
        phone: body.phone,
        zonecode: body.zonecode,
        address: body.address,
        detail_address: body.detail_address || null,
        membership_type: membershipType,
        membership_id: membershipId,
        matched_member_no: matchedMemberNo,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'internal_error',
          message: '서버 오류가 발생했습니다.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: { id: data.id } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
