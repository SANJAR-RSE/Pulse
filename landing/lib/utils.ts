type ClassValue = string | number | null | false | undefined | ClassValue[];

/**
 * Minimal className combiner (shadcn-style `cn`) without external deps —
 * flattens, drops falsy values, joins with a single space.
 */
export function cn(...inputs: ClassValue[]): string {
  const flatten = (items: ClassValue[]): string[] =>
    items.flatMap((item) => {
      if (!item && item !== 0) return [];
      if (Array.isArray(item)) return flatten(item);
      return [String(item)];
    });

  return flatten(inputs).join(" ");
}
