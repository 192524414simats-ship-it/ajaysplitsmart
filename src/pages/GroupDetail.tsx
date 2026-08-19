import { useEffect, useState } from 'react';
import {
  Plane, Home as HomeIcon, Users, Receipt, Scale, BarChart3, Calculator,
  PiggyBank, Plus, ArrowLeft, Calendar, Trash2, UserPlus, X, History, Check,
} from 'lucide-react';
import * as api from '@/api';
import type { Group, Expense, BalanceEntry, SettlementPayment } from '@/types';
import { formatCurrency, formatDate, monthLabel } from '@/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/Feedback';
import { ProgressBar } from '@/components/ProgressBar';
import { Avatar, AvatarGroup } from '@/components/Avatar';
import { Modal } from '@/components/Modal';
import { useRouter } from '@/router';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { GroupAnalytics } from '@/pages/GroupAnalytics';
import { WhatIfCalculator } from '@/pages/WhatIfCalculator';
import { BudgetPage } from '@/pages/BudgetPage';

type Tab = 'overview' | 'expenses' | 'balances' | 'settlement' | 'analytics' | 'whatif' | 'budget';

export function GroupDetail({ groupId }: { groupId: string }) {
  const { navigate } = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [settlement, setSettlement] = useState<SettlementPayment[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const g = await api.getGroup(groupId);
      if (!g) { setError('Group not found.'); setLoading(false); return; }
      setGroup(g);
      const es = await api.getExpenses(groupId);
      setExpenses(es);
      const balRes = await api.calculateBalance(es, g.members);
      setBalances(balRes.balances);
      const setRes = await api.calculateSettlement(balRes.balances.map((b) => ({ memberId: b.memberId, name: b.name, balance: b.balance })));
      setSettlement(setRes.payments);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the C backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [groupId]);

  async function handleDeleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return;
    await api.deleteExpense(id);
    load();
  }

  async function handleMarkPaid(idx: number) {
    const updated = [...settlement];
    updated[idx] = { ...updated[idx], paid: true };
    setSettlement(updated);
    const p = updated[idx];
    await api.markSettlementPaid(groupId, p.from, p.to);
  }

  if (loading) return <LoadingState label="Loading group..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!group) return <ErrorState message="Group not found." />;

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const isTrip = group.mode === 'trip';
  const ModeIcon = isTrip ? Plane : HomeIcon;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Receipt },
    { id: 'expenses', label: 'History', icon: History },
    { id: 'balances', label: 'Balances', icon: Scale },
    { id: 'settlement', label: 'Settlement', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'whatif', label: 'What-If?', icon: Calculator },
    { id: 'budget', label: 'Budget', icon: PiggyBank },
  ];

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button onClick={() => navigate('/groups')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Groups
      </button>

      {/* Group header */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isTrip ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-brand-50 dark:bg-brand-950/40'}`}>
              <ModeIcon className={`w-7 h-7 ${isTrip ? 'text-blue-500' : 'text-brand-500'}`} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="capitalize">{isTrip ? 'Trip Mode' : 'Shared Living'}</span>
                <span>·</span>
                <span>{group.members.length} members</span>
                {isTrip && group.startDate && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(group.startDate)} → {group.endDate ? formatDate(group.endDate) : ''}</span>
                  </>
                )}
                {!isTrip && group.currentMonth && (
                  <>
                    <span>·</span>
                    <span>{monthLabel(group.currentMonth)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddMember(true)} className="btn-ghost">
              <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Member</span>
            </button>
            <button onClick={() => setShowAddExpense(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          </div>
        </div>

        {/* Budget bar */}
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Budget Usage</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalSpent)} / {formatCurrency(group.budget)}</span>
          </div>
          <ProgressBar value={totalSpent} max={group.budget} height="md" showLabel />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fadeIn">
        {tab === 'overview' && (
          <OverviewTab group={group} expenses={expenses} balances={balances} settlement={settlement} onTab={setTab} onDeleteExpense={handleDeleteExpense} />
        )}
        {tab === 'expenses' && (
          <ExpensesTab expenses={expenses} group={group} onDelete={handleDeleteExpense} />
        )}
        {tab === 'balances' && (
          <BalancesTab balances={balances} />
        )}
        {tab === 'settlement' && (
          <SettlementTab payments={settlement} onMarkPaid={handleMarkPaid} />
        )}
        {tab === 'analytics' && (
          <GroupAnalytics groupId={groupId} />
        )}
        {tab === 'whatif' && (
          <WhatIfCalculator group={group} expenses={expenses} />
        )}
        {tab === 'budget' && (
          <BudgetPage group={group} expenses={expenses} onUpdated={load} />
        )}
      </div>

      {/* Add expense modal */}
      <AddExpenseModal
        open={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        group={group}
        onSaved={() => { setShowAddExpense(false); load(); }}
      />

      {/* Add member modal */}
      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        group={group}
        onSaved={() => { setShowAddMember(false); load(); }}
      />
    </div>
  );
}

// ============================================================
// Overview tab
// ============================================================
function OverviewTab({ group, expenses, balances, settlement, onTab, onDeleteExpense }: {
  group: Group; expenses: Expense[]; balances: BalanceEntry[]; settlement: SettlementPayment[];
  onTab: (t: Tab) => void; onDeleteExpense: (id: string) => void;
}) {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const currentUserId = api.getCurrentUserId();
  const myBalance = balances.find((b) => b.memberId === currentUserId);

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Summary */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Spent</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{expenses.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{group.members.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Settlements Needed</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{settlement.filter((s) => !s.paid).length}</span>
          </div>
        </div>
      </div>

      {/* Your balance */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Your Balance</h3>
        {myBalance ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">You Paid</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(myBalance.paid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your Share</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(myBalance.owed)}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Balance</span>
                <span className={`text-lg font-bold ${myBalance.balance > 0 ? 'text-brand-600' : myBalance.balance < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  {myBalance.balance > 0 ? '+' : ''}{formatCurrency(myBalance.balance)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {myBalance.balance > 0 ? 'You should receive money.' : myBalance.balance < 0 ? 'You need to pay.' : 'All settled up.'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Not a member of this group.</p>
        )}
      </div>

      {/* Members */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Members</h3>
        <div className="space-y-2.5">
          {group.members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar name={m.name} color={m.color} size="sm" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</span>
              {m.id === currentUserId && <span className="text-xs text-gray-400">You</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="card p-5 lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Recent Expenses</h3>
          <button onClick={() => onTab('expenses')} className="text-sm text-brand-600 dark:text-brand-400 font-medium">View all</button>
        </div>
        {expenses.length === 0 ? (
          <EmptyState icon={<Receipt className="w-6 h-6" />} title="No expenses yet" description="Add your first expense to get started." />
        ) : (
          <div className="space-y-2">
            {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((e) => (
              <ExpenseRow key={e.id} expense={e} onDelete={onDeleteExpense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Expenses tab (history)
// ============================================================
function ExpensesTab({ expenses, group, onDelete }: { expenses: Expense[]; group: Group; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterMember, setFilterMember] = useState('');

  const filtered = expenses.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && e.category !== filterCat) return false;
    if (filterMember && e.paidBy !== filterMember) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const categories = [...new Set(expenses.map((e) => e.category))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={filterMember} onChange={(e) => setFilterMember(e.target.value)}>
            <option value="">All Members</option>
            {group.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Receipt className="w-6 h-6" />} title="No expenses found" description="Try adjusting your filters or add a new expense." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Expense</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Paid By</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Split</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{e.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="chip bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{e.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600 dark:text-gray-400">{e.paidByName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 capitalize text-xs">{e.splitMethod}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(e.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Balances tab
// ============================================================
function BalancesTab({ balances }: { balances: BalanceEntry[] }) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Member Balances</h3>
        <div className="space-y-3">
          {balances.map((b) => (
            <div key={b.memberId} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{b.name}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Paid: {formatCurrency(b.paid)}</span>
                  <span>Share: {formatCurrency(b.owed)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${b.balance > 0 ? 'text-brand-600' : b.balance < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  {b.balance > 0 ? '+' : ''}{formatCurrency(b.balance)}
                </div>
                <div className="text-xs text-gray-500">
                  {b.balance > 0 ? 'receives' : b.balance < 0 ? 'pays' : 'settled'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Settlement tab
// ============================================================
function SettlementTab({ payments, onMarkPaid }: { payments: SettlementPayment[]; onMarkPaid: (idx: number) => void }) {
  const pending = payments.filter((p) => !p.paid);
  const done = payments.filter((p) => p.paid);

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Settlement</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pending.length > 0 ? `${pending.length} payment${pending.length > 1 ? 's' : ''} needed` : 'All settlements complete!'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-600">{pending.length}</div>
            <div className="text-xs text-gray-500">pending</div>
          </div>
        </div>

        {payments.length === 0 ? (
          <EmptyState icon={<Scale className="w-6 h-6" />} title="No settlements needed" description="Everyone is settled up. No payments required." />
        ) : (
          <div className="space-y-3">
            {pending.map((p, i) => {
              const idx = payments.indexOf(p);
              return (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Avatar name={p.fromName} size="sm" />
                  <span className="font-medium text-gray-900 dark:text-white">{p.fromName}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(p.amount)}</span>
                    <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{p.toName}</span>
                  <Avatar name={p.toName} size="sm" />
                  <button onClick={() => onMarkPaid(idx)} className="btn-primary ml-2 shrink-0">
                    <Check className="w-4 h-4" /> <span className="hidden sm:inline">Mark Paid</span>
                  </button>
                </div>
              );
            })}
            {done.length > 0 && (
              <>
                <div className="pt-3 text-xs font-medium text-gray-400">Completed</div>
                {done.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 opacity-60">
                    <Avatar name={p.fromName} size="sm" />
                    <span className="font-medium text-gray-900 dark:text-white">{p.fromName}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(p.amount)}</span>
                      <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{p.toName}</span>
                    <Avatar name={p.toName} size="sm" />
                    <span className="ml-2 chip bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"><Check className="w-3 h-3" /> Paid</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Add member modal
// ============================================================
function AddMemberModal({ open, onClose, group, onSaved }: { open: boolean; onClose: () => void; group: Group; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.addMember(group.id, name.trim());
      setName('');
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Member" size="sm">
      <div className="space-y-4">
        <div>
          <label className="label">Member Name</label>
          <input
            className="input"
            placeholder="e.g. Priya"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleAdd} disabled={saving || !name.trim()} className="btn-primary flex-1">
            {saving ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// Expense row helper
// ============================================================
function ExpenseRow({ expense, onDelete }: { expense: Expense; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
        <Receipt className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.category} · {expense.paidByName} · {formatDate(expense.date)}</p>
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">{formatCurrency(expense.amount)}</span>
      <button onClick={() => onDelete(expense.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}


