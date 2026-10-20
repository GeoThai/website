import { expect, test } from 'bun:test';

import { highlightRecord, rowToRecord } from './record';
import type { Row } from './search';

const row: Row = [
  '100608',
  'หัวหมาก',
  'Hua Mak',
  'บางกะปิ',
  'Bang Kapi',
  'กรุงเทพมหานคร',
  'Bangkok',
  ['10240', '10250'],
];

test('rowToRecord rebuilds the subdistrict record of GeoThai/data', () => {
  expect(rowToRecord(row)).toEqual({
    code: '100608',
    name_th: 'หัวหมาก',
    name_en: 'Hua Mak',
    district_code: '1006',
    province_code: '10',
    postal_codes: ['10240', '10250'],
  });
});

test('highlightRecord lines read back as the same JSON', () => {
  const lines = highlightRecord(rowToRecord(row));
  const text = lines.map((l) => l.map((t) => t.text).join('')).join('\n');
  expect(JSON.parse(text)).toEqual(rowToRecord(row));
  expect(
    lines
      .at(-2)
      ?.map((t) => t.text)
      .join(''),
  ).toBe('  "postal_codes": ["10240", "10250"]');
});

test('keys, values and punctuation get their own tone', () => {
  const [, code] = highlightRecord(rowToRecord(row));
  expect(code?.map((t) => [t.text, t.tone])).toEqual([
    ['  ', 'punct'],
    ['"code"', 'key'],
    [': ', 'punct'],
    ['"100608"', 'value'],
    [',', 'punct'],
  ]);
});
