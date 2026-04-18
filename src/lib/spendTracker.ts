import type { ParsedBillItem } from './billParser';

export interface BillRecord {
  id: string;
  date: string;
  source: string;
  items: ParsedBillItem[];
  total: number;
  imageUrl?: string;
}

export function calculateMonthlySpend(history: BillRecord[], monthDate: Date): number {
  const yearMonth = monthDate.toISOString().slice(0, 7);
  return history
    .filter(b => b.date.startsWith(yearMonth))
    .reduce((sum, b) => sum + b.total, 0);
}

export function groupSpendByCategory(history: BillRecord[], monthDate: Date): Record<string, number> {
  const yearMonth = monthDate.toISOString().slice(0, 7);
  const monthBills = history.filter(b => b.date.startsWith(yearMonth));
  const categorySpend: Record<string, number> = {};
  
  monthBills.forEach(bill => {
    // If bill items have no individual prices, we just can't accurately split this bill by category.
    // We'll just sum what we have.
    bill.items.forEach(item => {
      if (item.price) {
         categorySpend[item.category] = (categorySpend[item.category] || 0) + item.price;
      }
    });
  });
  
  return categorySpend;
}
