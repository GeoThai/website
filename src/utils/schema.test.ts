import { expect, test } from 'bun:test';

import { administrativeArea, breadcrumbs, graph } from './schema';

const page = new URL('https://geothai.fasu.dev/84-surat-thani/8405-ko-pha-ngan/');

test('breadcrumbs number the steps and link the last one to the page', () => {
  const list = breadcrumbs(
    [
      { label: 'Home', href: '/' },
      { label: 'Surat Thani', href: '/84-surat-thani/' },
      { label: 'Ko Pha-ngan' },
    ],
    page,
  );
  expect(list.itemListElement.map((i) => [i.position, i.item])).toEqual([
    [1, 'https://geothai.fasu.dev/'],
    [2, 'https://geothai.fasu.dev/84-surat-thani/'],
    [3, page.href],
  ]);
});

test('administrativeArea sits in its parent, or in Thailand at the top', () => {
  const area = { code: '8405', name_th: 'เกาะพะงัน', name_en: 'Ko Pha-ngan' };
  const parent = new URL('/84-surat-thani/', page);
  expect(administrativeArea(area, page, { parent }).containedInPlace).toEqual({
    '@id': parent.href,
  });
  expect(administrativeArea(area, page).containedInPlace).toEqual({
    '@type': 'Country',
    name: 'Thailand',
  });
  expect(administrativeArea(area, page)).not.toHaveProperty('address');
  expect(administrativeArea(area, page, { postal: ['84280'] }).address).toEqual([
    { '@type': 'PostalAddress', postalCode: '84280', addressCountry: 'TH' },
  ]);
});

test('graph adds the context once', () => {
  expect(graph({ '@type': 'Thing' })).toEqual({
    '@context': 'https://schema.org',
    '@graph': [{ '@type': 'Thing' }],
  });
});
