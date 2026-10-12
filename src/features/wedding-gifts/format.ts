export function parseAmount(text: string): number {
  const latin = text
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d]/g, '');
  return latin ? parseInt(latin, 10) : 0;
}

export const formatAmount = (n: number) => n.toLocaleString('en-US');