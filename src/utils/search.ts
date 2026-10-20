/** [code, name_th, name_en, district_th, district_en, province_th, province_en, postal_codes] */
export type Row = [string, string, string, string, string, string, string, string[]];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFC')
    .replaceAll(/[\s\-']/g, '');

export function searchRows(rows: Row[], query: string, limit = 8): Row[] {
  const q = norm(query);
  if (!q) return [];
  const exact: Row[] = [];
  const starts: Row[] = [];
  const contains: Row[] = [];
  for (const r of rows) {
    const keys = [r[1], r[2], r[0], ...r[7]].map(norm);
    if (keys.includes(q)) exact.push(r);
    else if (keys.some((k) => k.startsWith(q))) starts.push(r);
    else if (
      keys.some((k) => k.includes(q)) ||
      norm(r[3]).startsWith(q) ||
      norm(r[5]).startsWith(q)
    ) {
      contains.push(r);
    }
    if (exact.length + starts.length >= limit) break;
  }
  return [...exact, ...starts, ...contains].slice(0, limit);
}
