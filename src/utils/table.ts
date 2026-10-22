/** One row of a pasted table: the area name as written, and its number. */
export type TableRow = { name: string; value: number };

const toNumber = (text: string) => {
  const clean = text.replaceAll(/[\s,]/g, '');
  return clean === '' ? Number.NaN : Number(clean);
};

/** The name and the number of one line. A spreadsheet copies with tabs, a CSV file with commas. */
function cells(line: string): [string, string] {
  if (line.includes('\t')) {
    const [name = '', value = ''] = line.split('\t');
    return [name, value];
  }
  const at = line.search(/[;,]/);
  return at === -1 ? [line, ''] : [line.slice(0, at), line.slice(at + 1)];
}

/**
 * Reads a table pasted from a spreadsheet: a name, then a number, on each line.
 * A first line without a number is a header and is skipped. Blank lines are skipped.
 *
 * @param text - What the user pasted.
 * @returns The rows, and the lines after the first that had no number.
 */
export function parseTable(text: string): { rows: TableRow[]; skipped: string[] } {
  const rows: TableRow[] = [];
  const skipped: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  for (const [i, line] of lines.entries()) {
    const [name, value] = cells(line).map((c) => c.trim()) as [string, string];
    const n = toNumber(value);
    if (name && Number.isFinite(n)) rows.push({ name, value: n });
    else if (i > 0) skipped.push(line.trim());
  }
  return { rows, skipped };
}

const csvCell = (text: string) => (/[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text);

/**
 * Writes the rows back as CSV with a code column, for Datawrapper, Flourish or a spreadsheet.
 *
 * @param rows - The rows as read from the table.
 * @param found - The code of each name that was placed.
 * @returns CSV text: name, code, value. A name that was not placed has an empty code.
 */
export function toCsv(rows: TableRow[], found: Record<string, string>): string {
  return [
    'name,code,value',
    ...rows.map((r) => [csvCell(r.name), found[r.name] ?? '', String(r.value)].join(',')),
  ].join('\n');
}
