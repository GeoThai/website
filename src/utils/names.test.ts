import { expect, test } from 'bun:test';

import { closestName } from './names';

const areas = [
  { code: '30', name_th: 'นครราชสีมา', name_en: 'Nakhon Ratchasima' },
  { code: '84', name_th: 'สุราษฎร์ธานี', name_en: 'Surat Thani' },
  { code: '83', name_th: 'ภูเก็ต', name_en: 'Phuket' },
];

test('closestName finds an area whose name holds part of the input', () => {
  expect(closestName('สุราษฎร์', areas)?.code).toBe('84');
  expect(closestName('surat', areas)?.code).toBe('84');
  expect(closestName('จ.ภูเก็ตเมือง', areas)?.code).toBe('83');
});

test('closestName gives nothing for a nickname or a single letter', () => {
  expect(closestName('โคราช', areas)).toBeUndefined();
  expect(closestName('ก', areas)).toBeUndefined();
});
