import type { Guest } from './use-guests';


export function parseAmount(text: string): number {
  const latin = text
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d]/g, '');
  return latin ? parseInt(latin, 10) : 0;
}

export const formatAmount = (n: number) => n.toLocaleString('en-US');

const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export function guestsToCsv(guests: Guest[]) {
  const rows = guests.map((g) =>
    [g.name, g.amount, g.attended ? 'yes' : 'no', g.note ?? ''].map(esc).join(','),
  );
  return ['name,amount_toman,attended,note', ...rows].join('\n');
}