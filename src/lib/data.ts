export type Province = { code: string; name_th: string; name_en: string };
export type District = Province & { province_code: string };
export type Subdistrict = Province & {
  district_code: string;
  province_code: string;
  postal_codes: string[];
};

/** Set from data.version in astro.config.mjs. */
export const DATA_VERSION = import.meta.env.DATA_VERSION;

async function get<T>(path: string): Promise<T> {
  const url = `https://raw.githubusercontent.com/GeoThai/data/${DATA_VERSION}/${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`GeoThai/data ${DATA_VERSION}: HTTP ${res.status} for ${path}`);
  return (await res.json()) as T;
}

async function load() {
  const [provinces, districts, subdistricts] = await Promise.all([
    get<Province[]>('json/provinces.json'),
    get<District[]>('json/districts.json'),
    get<Subdistrict[]>('json/subdistricts.json'),
  ]);
  return { provinces, districts, subdistricts };
}

let cache: ReturnType<typeof load> | undefined;

export const loadData = () => (cache ??= load());

/** The place the home page shows before a search: Bangkok's first subdistrict. */
export async function startPlace() {
  const code = '100101';
  const { provinces, districts, subdistricts } = await loadData();
  const subdistrict = subdistricts.find((s) => s.code === code);
  const district = districts.find((d) => d.code === subdistrict?.district_code);
  const province = provinces.find((p) => p.code === subdistrict?.province_code);
  if (!subdistrict || !district || !province) {
    throw new Error(
      `start place ${code} or its parents are missing from GeoThai/data ${DATA_VERSION}`,
    );
  }
  return { province, district, subdistrict };
}

export async function loadChangelog() {
  const url = `https://raw.githubusercontent.com/GeoThai/data/${DATA_VERSION}/CHANGELOG.md`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`GeoThai/data ${DATA_VERSION}: HTTP ${res.status} for CHANGELOG.md`);
  return res.text();
}
