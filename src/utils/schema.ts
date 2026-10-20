/** schema.org JSON-LD for search engines. Every URL here is absolute. */

type Thing = Record<string, unknown>;

export const graph = (...things: Thing[]) => ({
  '@context': 'https://schema.org',
  '@graph': things,
});

/** The breadcrumb trail as a BreadcrumbList. The last step without a link is the page itself. */
export const breadcrumbs = (trail: { label: string; href?: string }[], page: URL) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((step, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: step.label,
    item: new URL(step.href ?? page.pathname, page).href,
  })),
});

type Area = { code: string; name_th: string; name_en: string };

/** A province, district or subdistrict, inside its parent page or inside Thailand. */
export const administrativeArea = (
  area: Area,
  page: URL,
  { parent, postal = [] }: { parent?: URL; postal?: string[] } = {},
) => ({
  '@type': 'AdministrativeArea',
  '@id': page.href,
  url: page.href,
  name: area.name_th,
  alternateName: area.name_en,
  identifier: area.code,
  containedInPlace: parent ? { '@id': parent.href } : { '@type': 'Country', name: 'Thailand' },
  ...(postal.length && {
    address: postal.map((postalCode) => ({
      '@type': 'PostalAddress',
      postalCode,
      addressCountry: 'TH',
    })),
  }),
});

type DatasetInfo = {
  name: string;
  description: string;
  url: string;
  version: string;
  created: string;
  license: string;
  repo: string;
  org: string;
  downloads: { format: string; url: string }[];
  sources: string[];
};

/** The GeoThai data as a Dataset, so Google Dataset Search can list it. */
export const dataset = (d: DatasetInfo) => ({
  '@type': 'Dataset',
  name: d.name,
  description: d.description,
  url: d.url,
  sameAs: d.repo,
  version: d.version,
  datePublished: d.created,
  license: d.license,
  isAccessibleForFree: true,
  inLanguage: ['th', 'en'],
  keywords: ['Thailand', 'provinces', 'districts', 'subdistricts', 'postal codes', 'open data'],
  creator: { '@type': 'Organization', name: 'GeoThai', url: d.org },
  spatialCoverage: { '@type': 'Country', name: 'Thailand' },
  isBasedOn: d.sources,
  distribution: d.downloads.map((x) => ({
    '@type': 'DataDownload',
    encodingFormat: x.format,
    contentUrl: x.url,
  })),
});
