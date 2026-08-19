import { useEffect, useState } from 'react';
import { Check, Info, AlertCircle } from 'lucide-react';
import * as api from '@/api';
import type { Group, Expense, SplitMethod, SplitShare } from '@/types';
import { Modal } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { formatCurrency } from '@/utils';
import { tripCategories, livingCategories } from '@/demoData';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  group: Group;
  onSaved: () => void;
}

const splitMethods: { id: SplitMethod; label: string; desc: string }[] = [
  { id: 'equal', label: 'Equal Split', desc: 'Divide equally among all members' },
  { id: 'custom', label: 'Custom Amount', desc: 'Enter amount per member' },
  { id: 'percentage', label: 'Percentage', desc: 'Assign percentages' },
  { id: 'usage', label: 'Usage-Based', desc: 'Split by units consumed' },
  { id: 'selected', label: 'Selected Members', desc: 'Only certain members share' },
];

export function AddExpenseModal({ open, onClose, group, onSaved }: AddExpenseModalProps) {
  const categories = group.mode === 'trip' ? tripCategories : livingCategories;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(categories[0]);
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [shares, setShares] = useState<SplitShare[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unitLabel, setUnitLabel] = useState('units');

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setName('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory(categories[0]);
      setPaidBy(group.members[0]?.id || '');
      setNotes('');
      setSplitMethod('equal');
      setUnitLabel('units');
      setError('');
      setShares([]);
    }
  }, [open, group.id]);

  // Recalculate shares whenever inputs change
  async function recalcShares(method: SplitMethod, memberData: any[]) {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0 || memberData.length === 0) { setShares([]); return; }
    setCalculating(true);
    setError('');
    try {
      const res = await api.calculateSplit({
        amount: amt,
        method,
        members: memberData,
        unitLabel,
      });
      setShares(res.shares);
    } catch (err: any) {
      setError('Unable to calculate split. Please check your inputs.');
    } finally {
      setCalculating(false);
    }
  }

  function handleMethodChange(method: SplitMethod) {
    setSplitMethod(method);
    setError('');
    const amt = parseFloat(amount) || 0;
    if (method === 'equal') {
      recalcShares(method, group.members.map((m) => ({ id: m.id, name: m.name })));
    } else if (method === 'selected') {
      recalcShares(method, group.members.map((m) => ({ id: m.id, name: m.name })));
    } else if (method === 'custom') {
      const per = amt / group.members.length;
      setShares(group.members.map((m) => ({ memberId: m.id, name: m.name, amount: Math.round(per * 100) / 100 })));
    } else if (method === 'percentage') {
      const per = 100 / group.members.length;
      setShares(group.members.map((m) => ({ memberId: m.id, name: m.name, amount: 0, percentage: Math.round(per * 10) / 10 })));
    } else if (method === 'usage') {
      setShares(group.members.map((m) => ({ memberId: m.id, name: m.name, amount: 0, units: 0 })));
    }
  }

  function updateShare(memberId: string, field: 'amount' | 'percentage' | 'units', value: number) {
    setShares((prev) => prev.map((s) => s.memberId === memberId ? { ...s, [field]: value } : s));
  }

  // For custom and percentage, validate before saving
  function validate(): boolean {
    const amt = parseFloat(amount) || 0;
    if (!name.trim()) { setError('Please enter an expense name.'); return false; }
    if (amt <= 0) { setError('Please enter a valid expense amount.'); return false; }
    if (!paidBy) { setError('Please select who paid.'); return false; }

    if (splitMethod === 'custom') {
      const total = shares.reduce((s, sh) => s + (sh.amount || 0), 0);
      if (Math.abs(total - amt) > 0.01) {
        setError(`Custom shares must total ${formatCurrency(amt)}. Currently ${formatCurrency(total)}.`);
        return false;
      }
    }
    if (splitMethod === 'percentage') {
      const total = shares.reduce((s, sh) => s + (sh.percentage || 0), 0);
      if (Math.abs(total - 100) > 0.1) {
        setError(`Percentages must add up to 100%. Currently ${total.toFixed(1)}%.`);
        return false;
      }
    }
    if (splitMethod === 'usage') {
      const hasNegative = shares.some((s) => (s.units || 0) < 0);
      if (hasNegative) { setError('Usage values cannot be negative.'); return false; }
      const totalUnits = shares.reduce((s, sh) => s + (sh.units || 0), 0);
      if (totalUnits === 0) { setError('Please enter usage values for at least one member.'); return false; }
    }
    if (splitMethod === 'selected') {
      if (shares.length === 0) { setError('Please select at least one member.'); return false; }
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      // For custom/percentage/usage, recalculate via the API to get final amounts
      let finalShares = shares;
      if (splitMethod === 'percentage' || splitMethod === 'usage' || splitMethod === 'custom') {
        const memberData = shares.map((s) => ({
          id: s.memberId, name: s.name,
          percentage: s.percentage, units: s.units, amount: s.amount,
        }));
        const res = await api.calculateSplit({
          amount: parseFloat(amount),
          method: splitMethod,
          members: memberData,
          unitLabel,
        });
        finalShares = res.shares;
      }

      const payer = group.members.find((m) => m.id === paidBy);
      const expense: Omit<Expense, 'id'> = {
        groupId: group.id,
        name: name.trim(),
        amount: parseFloat(amount),
        date,
        category,
        paidBy,
        paidByName: payer?.name || '',
        splitMethod,
        shares: finalShares,
        notes: notes.trim() || undefined,
        unitLabel: splitMethod === 'usage' ? unitLabel : undefined,
      };
      await api.createExpense(expense);
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Unable to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const amt = parseFloat(amount) || 0;

  return (
    <Modal open={open} onClose={onClose} title="Add Expense" size="lg">
      <div className="space-y-5">
        {/* Basic fields */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Expense Name</label>
            <input className="input" placeholder="e.g. Dinner at Tito's" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" className="input" placeholder="e.g. 2000" value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                // Recalculate equal split if amount changes
                if (splitMethod === 'equal' || splitMethod === 'selected') {
                  const val = parseFloat(e.target.value) || 0;
                  if (val > 0) {
                    recalcShares(splitMethod, group.members.map((m) => ({ id: m.id, name: m.name })));
                  }
                }
              }}
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Paid By</label>
            <select className="input" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {group.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="Add a note..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {/* Split method selector */}
        <div>
          <label className="label">How should this expense be split?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {splitMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMethodChange(m.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  splitMethod === m.id
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                  splitMethod === m.id ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                }`}>
                  {splitMethod === m.id && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{m.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Split configuration */}
        {splitMethod === 'usage' && (
          <div>
            <label className="label">Unit Label</label>
            <input className="input" placeholder="e.g. units, kg, km..." value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} />
          </div>
        )}

        {/* Shares display */}
        {amt > 0 && shares.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {splitMethod === 'equal' && 'Equal split'}
                {splitMethod === 'custom' && 'Custom amounts'}
                {splitMethod === 'percentage' && 'Percentage split'}
                {splitMethod === 'usage' && 'Usage-based split'}
                {splitMethod === 'selected' && 'Selected members'}
              </span>
              {calculating && <span className="text-xs text-gray-400">Calculating...</span>}
            </div>

            <div className="space-y-2">
              {shares.map((s) => (
                <div key={s.memberId} className="flex items-center gap-3">
                  <Avatar name={s.name} size="sm" />
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>

                  {splitMethod === 'custom' && (
                    <input
                      type="number"
                      className="input w-28 text-right"
                      value={s.amount || ''}
                      onChange={(e) => updateShare(s.memberId, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  )}
                  {splitMethod === 'percentage' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input w-20 text-right"
                        value={s.percentage || ''}
                        onChange={(e) => updateShare(s.memberId, 'percentage', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  )}
                  {splitMethod === 'usage' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input w-24 text-right"
                        placeholder="0"
                        value={s.units || ''}
                        onChange={(e) => updateShare(s.memberId, 'units', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-xs text-gray-400">{unitLabel}</span>
                    </div>
                  )}
                  {(splitMethod === 'equal' || splitMethod === 'selected') && (
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(s.amount)}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Totals / validation hints */}
            {splitMethod === 'custom' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                Total: {formatCurrency(shares.reduce((s, sh) => s + (sh.amount || 0), 0))} / {formatCurrency(amt)}
              </div>
            )}
            {splitMethod === 'percentage' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                Total: {shares.reduce((s, sh) => s + (sh.percentage || 0), 0).toFixed(1)}% / 100%
              </div>
            )}
            {splitMethod === 'usage' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                Total: {shares.reduce((s, sh) => s + (sh.units || 0), 0)} {unitLabel}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Expense</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
