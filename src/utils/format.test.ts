import { expect, test } from 'bun:test';

import { count, num, plural } from './format';

test('num adds thousands separators', () => {
  expect(num(7436)).toBe('7,436');
});

test('count picks singular for one, plural otherwise', () => {
  expect(count(1, 'district')).toBe('1 district');
  expect(count(0, 'district')).toBe('0 districts');
  expect(count(1200, 'place matches', 'places match')).toBe('1,200 places match');
});

test('plural returns only the noun', () => {
  expect(plural(1, 'province')).toBe('province');
  expect(plural(2, 'province')).toBe('provinces');
});
