import { expect, test } from 'bun:test';

import { parseTable, toCsv } from './table';

test('parseTable reads a spreadsheet copy and skips the header', () => {
  expect(parseTable('จังหวัด\tยอด\nกทม\t1,204\nจ.เชียงใหม่\t381\n')).toEqual({
    rows: [
      { name: 'กทม', value: 1204 },
      { name: 'จ.เชียงใหม่', value: 381 },
    ],
    skipped: [],
  });
});

test('parseTable reads commas and semicolons, with a thousands separator', () => {
  expect(parseTable('Chon Buri,1,290\nKhon Kaen; 210.5').rows).toEqual([
    { name: 'Chon Buri', value: 1290 },
    { name: 'Khon Kaen', value: 210.5 },
  ]);
});

test('parseTable reports later lines without a number', () => {
  expect(parseTable('Phuket\t150\nโคราช\t\n\n  \nSurat Thani\tn/a')).toEqual({
    rows: [{ name: 'Phuket', value: 150 }],
    skipped: ['โคราช', 'Surat Thani\tn/a'],
  });
});

test('toCsv adds the codes and quotes names that need it', () => {
  const rows = [
    { name: 'กทม', value: 1204 },
    { name: 'Chon "Buri", East', value: 290 },
    { name: 'โคราช', value: 260 },
  ];
  expect(toCsv(rows, { กทม: '10', 'Chon "Buri", East': '20' })).toBe(
    'name,code,value\nกทม,10,1204\n"Chon ""Buri"", East",20,290\nโคราช,,260',
  );
});
