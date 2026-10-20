import { expect, test } from 'bun:test';

import { type Row, searchRows } from './search';

const row = (
  code: string,
  th: string,
  en: string,
  postal: string[],
  district = 'อำเภอ',
  province = 'จังหวัด',
): Row => [code, th, en, district, 'District', province, 'Province', postal];

const rows = [
  row('901101', 'หาดใหญ่', 'Hat Yai', ['90110'], 'หาดใหญ่', 'สงขลา'),
  row('901102', 'ควนลัง', 'Khuan Lang', ['90110'], 'หาดใหญ่', 'สงขลา'),
  row('840503', 'เกาะเต่า', 'Ko Tao', ['84360'], 'เกาะพะงัน', 'สุราษฎร์ธานี'),
];

test('exact names and codes come first', () => {
  expect(searchRows(rows, 'Hat Yai')[0]?.[0]).toBe('901101');
  expect(searchRows(rows, '84360').map((r) => r[0])).toEqual(['840503']);
});

test('spaces, case and dashes do not matter', () => {
  expect(searchRows(rows, 'ko tao')[0]?.[0]).toBe('840503');
  expect(searchRows(rows, 'KOTAO')[0]?.[0]).toBe('840503');
});

test('a district name finds its subdistricts', () => {
  expect(searchRows(rows, 'หาดใหญ่').map((r) => r[0])).toEqual(['901101', '901102']);
});

test('an empty query finds nothing', () => {
  expect(searchRows(rows, '  ')).toEqual([]);
});
