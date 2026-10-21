import type { Row } from './search';

export type PlaceRecord = {
  code: string;
  name_th: string;
  name_en: string;
  district_code: string;
  province_code: string;
  postal_codes: string[];
};

export const rowToRecord = (r: Row): PlaceRecord => ({
  code: r[0],
  name_th: r[1],
  name_en: r[2],
  district_code: r[0].slice(0, 4),
  province_code: r[0].slice(0, 2),
  postal_codes: r[7],
});

export type Token = { text: string; tone: keyof typeof TONE };

/** The Poimandres colors that code-block.astro gives JSON, so both kinds of block match. */
export const TONE = {
  punct: 'text-[#a6accd]',
  key: 'text-[#e4f0fb]',
  value: 'text-[#5de4c7]',
} as const;

const value = (v: unknown): Token[] =>
  Array.isArray(v)
    ? [
        { text: '[', tone: 'punct' },
        ...v.flatMap((item, i) => [
          ...(i ? [{ text: ', ', tone: 'punct' } as const] : []),
          { text: JSON.stringify(item), tone: 'value' } as const,
        ]),
        { text: ']', tone: 'punct' },
      ]
    : [{ text: JSON.stringify(v), tone: 'value' }];

/** The record as indented JSON, one array of tokens per line, fields in the order GeoThai/data writes them. */
export function highlightRecord(record: PlaceRecord): Token[][] {
  const entries = Object.entries(record);
  const lines: Token[][] = [[{ text: '{', tone: 'punct' }]];
  entries.forEach(([k, v], i) => {
    const line: Token[] = [
      { text: '  ', tone: 'punct' },
      { text: JSON.stringify(k), tone: 'key' },
      { text: ': ', tone: 'punct' },
    ];
    line.push(...value(v));
    if (i < entries.length - 1) line.push({ text: ',', tone: 'punct' });
    lines.push(line);
  });
  lines.push([{ text: '}', tone: 'punct' }]);
  return lines;
}
