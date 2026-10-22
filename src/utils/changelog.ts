export type Change = { code: string; detail: string };
export type Section = { kind: string; label: string; count: number; changes: Change[] };
export type Release = { version: string; date: string; notes: string[]; sections: Section[] };

const LABELS: Record<string, string> = {
  added: 'Added',
  removed: 'Removed',
  abolished: 'Abolished',
  abolished_on: 'Abolish dates',
  parent_code: 'Moved to another parent',
  name_th: 'Thai names',
  name_en: 'English names',
  postal_codes: 'Postal codes',
  successors: 'Replaced by',
};

/** Reads the CHANGELOG.md that GeoThai/source writes: `## vY.M.D`, notes, `### kind (n)`, `- code: detail`. */
export function parseChangelog(text: string): Release[] {
  const releases: Release[] = [];
  let release: Release | undefined;
  let section: Section | undefined;
  for (const line of text.split('\n')) {
    const version = /^## v(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(line);
    const kind = /^### (\w+) \((\d+)\)$/.exec(line);
    const change = /^- (\d+): (.*)$/.exec(line);
    if (version) {
      const [, y, m, d] = version;
      release = {
        version: `v${y}.${m}.${d}`,
        date: `${y}-${m?.padStart(2, '0')}-${d?.padStart(2, '0')}`,
        notes: [],
        sections: [],
      };
      section = undefined;
      releases.push(release);
    } else if (release && kind) {
      const [, k = '', n = '0'] = kind;
      section = { kind: k, label: LABELS[k] ?? k, count: Number(n), changes: [] };
      release.sections.push(section);
    } else if (section && change) {
      section.changes.push({ code: change[1] ?? '', detail: change[2] ?? '' });
    } else if (release && !section && line.trim()) {
      release.notes.push(line.trim());
    }
  }
  return releases;
}
