import { useState } from 'react';
import { PiggyBank, AlertTriangle, Check, TrendingUp } from 'lucide-react';
import * as api from '@/api';
import type { Group, Expense } from '@/types';
import { formatCurrency } from '@/utils';
import { ProgressBar } from '@/components/ProgressBar';

export function BudgetPage({ group, expenses, onUpdated }: { group: Group; expenses: Expense[]; onUpdated: () => void }) {
  const [budget, setBudget] = useState(group.budget.toString());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetNum = group.budget;
  const remaining = budgetNum - totalSpent;
  const isOver = totalSpent > budgetNum;
  const pct = budgetNum > 0 ? (totalSpent / budgetNum) * 100 : 0;

  async function handleSave() {
    const val = parseFloat(budget) || 0;
    setSaving(true);
    try {
      await api.setBudget(group.id, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Budget overview */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="w-5 h-5 text-brand-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Budget Overview</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 mb-1">Budget</div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budgetNum)}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 mb-1">Spent</div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 mb-1">Remaining</div>
            <div className={`text-lg sm:text-xl font-bold ${isOver ? 'text-red-500' : 'text-brand-600'}`}>
              {formatCurrency(Math.abs(remaining))}
            </div>
          </div>
        </div>
        <ProgressBar value={totalSpent} max={budgetNum} height="lg" showLabel />
        {isOver && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            Budget exceeded by {formatCurrency(totalSpent - budgetNum)}.
          </div>
        )}
      </div>

      {/* Edit budget */}
      <div className="card p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Set Group Budget</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">Budget Amount (₹)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 20000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Budget'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Expenses are not blocked when the budget is exceeded — you'll just see a warning.
        </p>
      </div>

      {/* Category breakdown */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Spending by Category</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(
            expenses.reduce((acc, e) => {
              acc[e.category] = (acc[e.category] || 0) + e.amount;
              return acc;
            }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">{cat}</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(amt)}</span>
              </div>
              <ProgressBar value={amt} max={totalSpent} height="sm" color="amber" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
