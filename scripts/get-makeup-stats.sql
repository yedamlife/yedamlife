-- 고인 메이크업 비용 통계 RPC
-- docs/비용/메이크업.md 참고
-- 적용: Supabase SQL Editor에서 실행

CREATE OR REPLACE FUNCTION get_makeup_stats()
RETURNS TABLE(
  hall_count int,
  avg_amount int,
  median_amount int,
  min_amount int,
  max_amount int,
  sample_count int
)
LANGUAGE sql STABLE AS $$
  WITH makeup_fees AS (
    SELECT
      h.facility_cd,
      (fee->>'요금')::int AS amount
    FROM funeral_halls h
    CROSS JOIN LATERAL jsonb_array_elements(
      COALESCE(h.facility_fees, '[]'::jsonb) || COALESCE(h.service_items, '[]'::jsonb)
    ) AS fee
    WHERE fee->>'판매여부' = 'Y'
      AND fee::text LIKE '%메이크업%'
      AND (fee->>'요금')::int > 0
      AND fee->>'품종' <> '시설임대료'
  )
  SELECT
    COUNT(DISTINCT facility_cd)::int,
    ROUND(AVG(amount))::int,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::int,
    MIN(amount)::int,
    MAX(amount)::int,
    COUNT(*)::int
  FROM makeup_fees;
$$;
