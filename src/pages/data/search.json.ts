import type { APIRoute } from 'astro';

import { loadData } from '@/lib/data';
import type { Row } from '@/utils/search';

export const GET: APIRoute = async () => {
  const { provinces, districts, subdistricts } = await loadData();
  const province = new Map(provinces.map((p) => [p.code, p]));
  const district = new Map(districts.map((d) => [d.code, d]));
  const rows = subdistricts.map((s): Row => {
    const d = district.get(s.district_code);
    const p = province.get(s.province_code);
    if (!d || !p) throw new Error(`subdistrict ${s.code}: parent missing`);
    return [
      s.code,
      s.name_th,
      s.name_en,
      d.name_th,
      d.name_en,
      p.name_th,
      p.name_en,
      s.postal_codes,
    ];
  });
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
};
