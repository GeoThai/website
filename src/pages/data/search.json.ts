import type { APIRoute } from 'astro';

import { loadData, parentsOf } from '@/lib/data';
import type { Row } from '@/utils/search';

export const GET: APIRoute = async () => {
  const data = await loadData();
  const rows = data.subdistricts.map((s): Row => {
    const { province: p, district: d } = parentsOf(s, data);
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
