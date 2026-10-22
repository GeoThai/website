import { expect, test } from 'bun:test';

import { parseChangelog } from './changelog';

const text = `# Changelog

## v2026.10.27

Cause: corrections changed.

### postal_codes (2)

- 100608: "10240" → "10240,10250"
- 102704: "10240" → "10230,10240"

### added (1)

- 961401: subdistrict ตำบลใหม่

## v2026.10.20

First release from the new pipeline. Built from scratch, not compatible with v1 to v4.
`;

test('parseChangelog reads releases newest first with their notes and sections', () => {
  const [latest, first] = parseChangelog(text);
  expect(latest).toEqual({
    version: 'v2026.10.27',
    date: '2026-10-27',
    notes: ['Cause: corrections changed.'],
    sections: [
      {
        kind: 'postal_codes',
        label: 'Postal codes',
        count: 2,
        changes: [
          { code: '100608', detail: '"10240" → "10240,10250"' },
          { code: '102704', detail: '"10240" → "10230,10240"' },
        ],
      },
      {
        kind: 'added',
        label: 'Added',
        count: 1,
        changes: [{ code: '961401', detail: 'subdistrict ตำบลใหม่' }],
      },
    ],
  });
  expect(first?.notes).toEqual([
    'First release from the new pipeline. Built from scratch, not compatible with v1 to v4.',
  ]);
  expect(first?.sections).toEqual([]);
});

test('single-digit months and days get a padded date', () => {
  expect(parseChangelog('## v2027.1.5\n\nx\n')[0]?.date).toBe('2027-01-05');
});

test('parseChangelog labels successors and keeps the basis in the detail', () => {
  const [release] = parseChangelog(`# Changelog

## v2026.10.22

### successors (2)

- 104701: บางนา → 104702, 104703 from 2017-07-26
- 100205: บางซื่อ → 102901 by name
`);
  expect(release?.sections[0]).toMatchObject({
    kind: 'successors',
    label: 'Replaced by',
    count: 2,
  });
  expect(release?.sections[0]?.changes[1]).toEqual({
    code: '100205',
    detail: 'บางซื่อ → 102901 by name',
  });
});
