/** An area name to offer when a pasted name matched nothing. */
export type Named = { code: string; name_th: string; name_en: string };

const key = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFC')
    .replaceAll(/[\s.'-]/g, '');

/**
 * Finds the area a name most likely meant: one whose name holds it, or is held by it.
 * "โคราช" finds nothing, because it is a nickname, not part of นครราชสีมา.
 *
 * @param name - The name that matched nothing.
 * @param areas - The areas of the map.
 * @returns The first area that shares the name, or `undefined`.
 */
export function closestName<T extends Named>(name: string, areas: T[]): T | undefined {
  const q = key(name.replace(/^\s*(?:จ|อ|ต)\.\s*/, ''));
  if (q.length < 2) return undefined;
  return areas.find((a) =>
    [key(a.name_th), key(a.name_en)].some((k) => k.includes(q) || (k.length > 2 && q.includes(k))),
  );
}
