// 서울권 장례식장의 수의 / 관 / 유골함 가격 데이터 추출 → CSV
// 실행: node scripts/export-seoul-supplies-csv.mjs

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEOUL_SIDO_CD = '6110000';
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  'docs/csv/서울권-수의-관-유골함.csv',
);

// 페이지네이션으로 서울권 장례식장 전체 fetch
async function fetchSeoulHalls() {
  const all = [];
  const PAGE = 500;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('funeral_halls')
      .select(
        'facility_cd, company_name, full_address, sido_cd, gungu_cd, funeral_supplies',
      )
      .eq('sido_cd', SEOUL_SIDO_CD)
      .range(from, from + PAGE - 1);

    if (error) {
      console.error('fetch error:', error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows, headers) {
  const out = [headers.map(csvEscape).join(',')];
  for (const r of rows) {
    out.push(headers.map((h) => csvEscape(r[h])).join(','));
  }
  return out.join('\n');
}

async function main() {
  console.log('서울권 장례식장 데이터 fetch...');
  const halls = await fetchSeoulHalls();
  console.log(`총 ${halls.length}곳`);

  const shroudRows = []; // 수의
  const coffinRows = []; // 관
  const urnRows = []; // 유골함

  for (const hall of halls) {
    const supplies = Array.isArray(hall.funeral_supplies)
      ? hall.funeral_supplies
      : [];
    for (const item of supplies) {
      const isSale =
        item['판매여부'] === 'Y' && item['판매구분'] === '판매';
      const amt = Number(item['요금'] ?? 0);
      if (!isSale || amt <= 0) continue;
      const cat = item['품종'] ?? '';
      const detail = item['품종상세'] ?? '';
      const name = item['품명'] ?? '';
      const etc =
        typeof item['기타정보'] === 'string' ? item['기타정보'] : '';

      const base = {
        장례식장: hall.company_name,
        주소: hall.full_address,
        품명: name,
        품종상세: detail,
        기타정보: etc,
        요금: amt,
        요금_표시: item['요금_표시'] ?? '',
      };

      if (cat === '수의') shroudRows.push(base);
      else if (cat === '관') coffinRows.push(base);
      else if (cat === '유골함') urnRows.push(base);
    }
  }

  // 정렬: 장례식장 → 요금 오름차순
  const cmp = (a, b) =>
    a.장례식장.localeCompare(b.장례식장, 'ko') || a.요금 - b.요금;
  shroudRows.sort(cmp);
  coffinRows.sort(cmp);
  urnRows.sort(cmp);

  console.log(
    `수의 ${shroudRows.length}건 / 관 ${coffinRows.length}건 / 유골함 ${urnRows.length}건`,
  );

  // 단일 CSV에 분류 섹션으로 합치기 (Excel/Numbers에서 열어도 보기 편하도록 빈 줄로 분리)
  const headers = [
    '장례식장',
    '주소',
    '품명',
    '품종상세',
    '기타정보',
    '요금',
    '요금_표시',
  ];
  const sections = [
    { title: '== 수의 ==', rows: shroudRows },
    { title: '== 관 ==', rows: coffinRows },
    { title: '== 유골함 ==', rows: urnRows },
  ];

  const parts = [];
  for (const sec of sections) {
    parts.push(sec.title);
    parts.push(rowsToCsv(sec.rows, headers));
    parts.push('');
  }
  const csv = parts.join('\n');

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, '﻿' + csv, 'utf-8'); // UTF-8 BOM (Excel 호환)
  console.log(`✔ 저장: ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
