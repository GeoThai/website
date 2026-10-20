import { expect, test } from 'bun:test';

import { areaSlug } from './slug';

test('areaSlug joins the code and a lowercase ASCII name', () => {
  expect(areaSlug({ code: '10', name_en: 'Bangkok' })).toBe('10-bangkok');
  expect(areaSlug({ code: '14', name_en: 'Phra Nakhon Si Ayutthaya' })).toBe(
    '14-phra-nakhon-si-ayutthaya',
  );
  expect(areaSlug({ code: '82', name_en: 'Phang-nga' })).toBe('82-phang-nga');
});

test('areaSlug drops accents and falls back to the code', () => {
  expect(areaSlug({ code: '1001', name_en: 'Phrá  Nakhon!' })).toBe('1001-phra-nakhon');
  expect(areaSlug({ code: '840599', name_en: '' })).toBe('840599');
});
