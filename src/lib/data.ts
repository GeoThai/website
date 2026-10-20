export type Province = { code: string; name_th: string; name_en: string };
export type District = Province & { province_code: string };
export type Subdistrict = Province & {
  district_code: string;
  province_code: string;
  postal_codes: string[];
};

/** The GeoThai/data release this build reads, from data.version. */
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

/** Downloads the pinned release once per build. */
export const loadData = () => (cache ??= load());
