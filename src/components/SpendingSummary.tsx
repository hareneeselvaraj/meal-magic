import { useState } from 'react';
import { useGrocery } from '@/context/GroceryContext';
import { calculateMonthlySpend, groupSpendByCategory } from '@/lib/spendTracker';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, IndianRupee } from 'lucide-react';

export default function SpendingSummary() {
  const { billHistory } = useGrocery();
  const [expanded, setExpanded] = useState(false);

  if (!billHistory || billHistory.length === 0) return null;

  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  const currentSpend = calculateMonthlySpend(billHistory, today);
  const previousSpend = calculateMonthlySpend(billHistory, lastMonth);
  const currentMonthBillsCount = billHistory.filter(b => b.date.startsWith(today.toISOString().slice(0, 7))).length;

  const diff = currentSpend - previousSpend;
  const pctChange = previousSpend === 0 ? 0 : Math.round((Math.abs(diff) / previousSpend) * 100);

  const categorySpend = groupSpendByCategory(billHistory, today);
  const sortedCategories = Object.entries(categorySpend).sort((a, b) => b[1] - a[1]);
  const highestCategorySpend = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-emerald-100 dark:border-slate-800 p-4 mb-4 overflow-hidden transition-all duration-300">
      <div 
        className="flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform" 
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            💰 This Month's Spending
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-extrabold text-gray-800 dark:text-slate-100 flex items-center">
              <IndianRupee size={20} strokeWidth={3} />
              {currentSpend.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium pb-1">
              (from {currentMonthBillsCount} bills)
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          {previousSpend > 0 && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${diff <= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
              {diff <= 0 ? <TrendingDown size={12} strokeWidth={3} /> : <TrendingUp size={12} strokeWidth={3} />}
              {pctChange}%
            </div>
          )}
          <button className="text-gray-400 hover:text-emerald-500 transition-colors p-1">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && sortedCategories.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3 animate-fade-in">
          <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-2">SPEND BY CATEGORY</h4>
          {sortedCategories.map(([category, amount]) => {
            const widthPct = Math.max(5, (amount / highestCategorySpend) * 100);
            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <span className="capitalize">{category.replace('_', ' ')}</span>
                  <span>₹{Math.round(amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full w-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" 
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {expanded && sortedCategories.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-center text-xs text-gray-500 py-2">
          No itemized prices found in this month's bills.
        </div>
      )}
    </div>
  );
}
