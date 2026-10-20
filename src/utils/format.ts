/** A count with thousands separators, e.g. `7,436`. */
export const num = (n: number) => n.toLocaleString('en');

/** The noun for a count: singular for one, plural otherwise. */
export const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many);

/** A count and its noun, e.g. `1 district`, `928 districts`. */
export const count = (n: number, one: string, many = `${one}s`) =>
  `${num(n)} ${plural(n, one, many)}`;
