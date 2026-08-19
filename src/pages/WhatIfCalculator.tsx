import { useState } from 'react';
import { Calculator, Info, ArrowRight, Sparkles } from 'lucide-react';
import * as api from '@/api';
import type { Group, Expense, SplitMethod, SplitShare, WhatIfResult } from '@/types';
import { formatCurrency, getSignedCurrency } from '@/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/Feedback';
import { Avatar } from '@/components/Avatar';

export function WhatIfCalculator({ group, expenses }: { group: Group; expenses: Expense[] }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || '');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSimulate() {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) { setError('Please enter a valid amount.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      // Build shares based on method
      let shares: SplitShare[] = [];
      if (splitMethod === 'equal') {
        const per = Math.round((amt / group.members.length) * 100) / 100;
        shares = group.members.map((m, i) => ({
          memberId: m.id, name: m.name,
          amount: i === group.members.length - 1 ? Math.round((amt - per * (group.members.length - 1)) * 100) / 100 : per,
        }));
      } else if (splitMethod === 'selected') {
        const per = Math.round((amt / group.members.length) * 100) / 100;
        shares = group.members.map((m, i) => ({
          memberId: m.id, name: m.name,
          amount: i === group.members.length - 1 ? Math.round((amt - per * (group.members.length - 1)) * 100) / 100 : per,
        }));
      } else {
        // For other methods, use equal as a simple simulation
        const per = Math.round((amt / group.members.length) * 100) / 100;
        shares = group.members.map((m, i) => ({
          memberId: m.id, name: m.name,
          amount: i === group.members.length - 1 ? Math.round((amt - per * (group.members.length - 1)) * 100) / 100 : per,
        }));
      }

      const res = await api.whatIf({
        expenses,
        members: group.members,
        hypothetical: {
          name: name || 'Hypothetical Expense',
          amount: amt,
          paidBy,
          splitMethod,
          shares,
        },
      });
      setResult(res.result);
    } catch (err: any) {
      setError(err.message || 'Unable to run simulation.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="card p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>What-If?</strong> lets you test a hypothetical expense without saving it. This is a simulation — no expense will be added.
          </p>
        </div>
      </div>

      {/* Input form */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-brand-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Simulate an Expense</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Expense Name (optional)</label>
            <input className="input" placeholder="e.g. Dinner ₹2000" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" className="input" placeholder="e.g. 2000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Paid By</label>
            <select className="input" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {group.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Split Method</label>
            <select className="input" value={splitMethod} onChange={(e) => setSplitMethod(e.target.value as SplitMethod)}>
              <option value="equal">Equal Split</option>
              <option value="selected">Selected Members</option>
            </select>
          </div>
        </div>
        <button onClick={handleSimulate} disabled={loading} className="btn-primary mt-4">
          <Sparkles className="w-4 h-4" /> {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>

      {/* Results */}
      {loading && <LoadingState label="Calculating..." />}
      {result && (
        <div className="card p-5 animate-fadeIn">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Simulation Results</h3>
          <div className="space-y-3">
            {result.differences.map((d) => (
              <div key={d.memberId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <Avatar name={d.name} size="sm" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(d.current)} → {getSignedCurrency(d.projected)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${d.change > 0 ? 'text-brand-600' : d.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {d.change > 0 ? '+' : ''}{formatCurrency(d.change)}
                  </div>
                  <div className="text-xs text-gray-400">change</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-sm text-brand-700 dark:text-brand-300 flex items-center gap-2">
            <Info className="w-4 h-4" />
            This was a simulation. No expense was added to the group.
          </div>
        </div>
      )}
      {!loading && !result && !error && (
        <EmptyState
          icon={<Calculator className="w-6 h-6" />}
          title="Ready to simulate"
          description="Enter an expense above and click Run Simulation to see how it would affect everyone's balance."
        />
      )}
    </div>
  );
}
