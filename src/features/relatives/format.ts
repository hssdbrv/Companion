export type RelationType = 'parent' | 'spouse' | 'sibling' | 'cousin';

export type RelationOption = {
  key: string;
  label: string;
  type: RelationType;
  /** true when the person being edited is stored as `a` (first side) */
  selfIsA: boolean;
};

/**
 * Stored as "a is <type> of b". For 'parent', a is the parent and b the child.
 * Spouse / sibling / cousin are symmetric.
 */
export const RELATION_OPTIONS: RelationOption[] = [
  { key: 'childOf', label: 'Child of', type: 'parent', selfIsA: false },
  { key: 'parentOf', label: 'Parent of', type: 'parent', selfIsA: true },
  { key: 'spouseOf', label: 'Spouse of', type: 'spouse', selfIsA: true },
  { key: 'siblingOf', label: 'Sibling of', type: 'sibling', selfIsA: true },
  { key: 'cousinOf', label: 'Cousin of', type: 'cousin', selfIsA: true },
];

function toLatinDigits(text: string) {
  return text
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** 4-digit year. Years below 1700 are treated as Persian-calendar years (+621). */
export function parseYear(text: string): number | null {
  const digits = toLatinDigits(text).replace(/\D/g, '');
  if (digits.length !== 4) return null;
  let year = parseInt(digits, 10);
  if (year < 1700) year += 621;
  return year >= 1800 && year <= new Date().getFullYear() ? year : null;
}

export function ageOf(birthYear: number | null): number | null {
  if (!birthYear) return null;
  return Math.max(0, new Date().getFullYear() - birthYear);
}

export function subtitleOf(r: { birth_year: number | null; deceased: number }): string {
  const parts: string[] = [];
  if (r.deceased) parts.push('Passed away');
  if (r.birth_year) {
    parts.push(r.deceased ? `Born ${r.birth_year}` : `${ageOf(r.birth_year)} years old`);
  }
  return parts.join(' · ');
}