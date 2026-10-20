import { dataset } from '@/utils/schema';

export type Province = { code: string; name_th: string; name_en: string };
export type District = Province & { province_code: string };
export type Subdistrict = Province & {
  district_code: string;
  province_code: string;
  postal_codes: string[];
};

/** Set from data.version in astro.config.mjs. */
export const DATA_VERSION = import.meta.env.DATA_VERSION;

export const SITE_URL = import.meta.env.SITE;
export const ORG_URL = 'https://github.com/GeoThai';
export const REPO_URL = `${ORG_URL}/data`;
/** jsDelivr serves every file of the pinned release. */
export const CDN_URL = `https://cdn.jsdelivr.net/gh/GeoThai/data@${DATA_VERSION}`;
export const releaseUrl = (version: string = DATA_VERSION) => `${REPO_URL}/releases/tag/${version}`;
export const downloadUrl = (kind: 'json' | 'csv', version: string = DATA_VERSION) =>
  `${REPO_URL}/releases/download/${version}/geothai-${kind}.zip`;

async function raw(path: string) {
  const url = `https://raw.githubusercontent.com/GeoThai/data/${DATA_VERSION}/${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`GeoThai/data ${DATA_VERSION}: HTTP ${res.status} for ${path}`);
  return res;
}

const get = async <T>(path: string) => (await (await raw(path)).json()) as T;

export type Field = {
  name: string;
  type: string;
  description: string;
  constraints?: { required?: boolean; pattern?: string; enum?: string[] };
};
export type DataPackage = {
  title: string;
  description: string;
  version: string;
  created: string;
  licenses: { name: string; path: string }[];
  sources: { title: string; path: string }[];
  counts: Record<string, number>;
  resources: { name: string; path: string; format: string; schema?: { fields: Field[] } }[];
};

async function load() {
  const [provinces, districts, subdistricts, datapackage] = await Promise.all([
    get<Province[]>('json/provinces.json'),
    get<District[]>('json/districts.json'),
    get<Subdistrict[]>('json/subdistricts.json'),
    get<DataPackage>('datapackage.json'),
  ]);
  const provinceBy = new Map(provinces.map((p) => [p.code, p]));
  const districtBy = new Map(districts.map((d) => [d.code, d]));
  const byPostal = new Map<string, Subdistrict[]>();
  for (const s of subdistricts) {
    for (const code of s.postal_codes) byPostal.set(code, [...(byPostal.get(code) ?? []), s]);
  }
  return {
    provinces,
    districts,
    subdistricts,
    datapackage,
    provinceBy,
    districtBy,
    byPostal: new Map([...byPostal].sort(([a], [b]) => a.localeCompare(b))),
  };
}

export type Data = Awaited<ReturnType<typeof load>>;

let cache: ReturnType<typeof load> | undefined;

export const loadData = () => (cache ??= load());

/** The province and district a subdistrict sits in. Throws if the data has a gap. */
export function parentsOf(s: Subdistrict, { provinceBy, districtBy }: Data) {
  const province = provinceBy.get(s.province_code);
  const district = districtBy.get(s.district_code);
  if (!province || !district) throw new Error(`subdistrict ${s.code}: parent missing`);
  return { province, district };
}

/** Every postal code of these subdistricts, once each, sorted. */
export const postalCodes = (subs: Subdistrict[]) =>
  [...new Set(subs.flatMap((s) => s.postal_codes))].sort();

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

export const loadChangelog = async () => (await raw('CHANGELOG.md')).text();

/** schema.org Dataset for the pinned release, built from its datapackage.json. */
export async function datasetLd() {
  const { datapackage } = await loadData();
  return dataset({
    name: datapackage.title,
    description: datapackage.description,
    url: new URL('/', SITE_URL).href,
    version: datapackage.version,
    created: datapackage.created,
    license: datapackage.licenses[0]?.path ?? '',
    repo: REPO_URL,
    org: ORG_URL,
    downloads: [
      { format: 'application/zip', url: downloadUrl('json') },
      { format: 'application/zip', url: downloadUrl('csv') },
    ],
    sources: datapackage.sources.map((s) => s.path),
  });
}
