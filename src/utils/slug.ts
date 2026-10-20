/** URL segment for an area: its code, then its English name in lowercase ASCII, e.g. `10-bangkok`. */
export function areaSlug(area: { code: string; name_en: string }) {
  const name = area.name_en
    .normalize('NFKD')
    .replaceAll(/[^\x20-\x7e]/g, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
  return name ? `${area.code}-${name}` : area.code;
}
