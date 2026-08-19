import { useEffect, useState } from 'react';
import {
  Receipt, ArrowDownLeft, ArrowUpRight, PiggyBank, Users, TrendingUp,
  Plus, Wallet, Plane, Home as HomeIcon, ChevronRight, AlertTriangle,
} from 'lucide-react';
import * as api from '@/api';
import type { Group, Expense, BalanceEntry } from '@/types';
import { formatCurrency, formatDateShort } from '@/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/Feedback';
import { ProgressBar } from '@/components/ProgressBar';
import { AvatarGroup } from '@/components/Avatar';
import { useRouter } from '@/router';

interface DashboardProps {
  onAddExpense: () => void;
  onAddGroup: () => void;
}

export function Dashboard({ onAddExpense, onAddGroup }: DashboardProps) {
  const { navigate } = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Record<string, BalanceEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const gs = await api.getGroups();
      const es = await api.getExpenses();
      setGroups(gs);
      setExpenses(es);
      const balMap: Record<string, BalanceEntry[]> = {};
      for (const g of gs) {
        const gExpenses = es.filter((e) => e.groupId === g.id);
        const res = await api.calculateBalance(gExpenses, g.members);
        balMap[g.id] = res.balances;
      }
      setBalances(balMap);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the C backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const currentUserId = api.getCurrentUserId();
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = groups.reduce((s, g) => s + g.budget, 0);

  let youOwe = 0;
  let youAreOwed = 0;
  Object.values(balances).flat().forEach((b) => {
    if (b.memberId === currentUserId) {
      if (b.balance < 0) youOwe += -b.balance;
      if (b.balance > 0) youAreOwed += b.balance;
    }
  });

  const recentExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const stats = [
    { label: 'Total Spent', value: formatCurrency(totalSpent), icon: Receipt, color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-800/50' },
    { label: 'You Owe', value: formatCurrency(youOwe), icon: ArrowDownLeft, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
    { label: "You're Owed", value: formatCurrency(youAreOwed), icon: ArrowUpRight, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950/30' },
    { label: 'Remaining Budget', value: formatCurrency(Math.max(totalBudget - totalSpent, 0)), icon: PiggyBank, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of all your groups and expenses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onAddGroup} className="btn-secondary">
            <Plus className="w-4 h-4" /> Create Group
          </button>
          <button onClick={onAddExpense} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-4 sm:p-5 animate-fadeIn" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Budget progress */}
      {totalBudget > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Budget Usage</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <ProgressBar value={totalSpent} max={totalBudget} height="lg" showLabel />
          {totalSpent > totalBudget && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Budget exceeded by {formatCurrency(totalSpent - totalBudget)}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Active groups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Groups</h2>
            <button onClick={() => navigate('/groups')} className="text-sm text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((g) => {
              const gExpenses = expenses.filter((e) => e.groupId === g.id);
              const spent = gExpenses.reduce((s, e) => s + e.amount, 0);
              const Icon = g.mode === 'trip' ? Plane : HomeIcon;
              return (
                <button
                  key={g.id}
                  onClick={() => navigate(`/groups/${g.id}`)}
                  className="card p-5 text-left hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.mode === 'trip' ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-brand-50 dark:bg-brand-950/40'}`}>
                        <Icon className={`w-5 h-5 ${g.mode === 'trip' ? 'text-blue-500' : 'text-brand-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{g.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{g.members.length} members · {gExpenses.length} expenses</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <AvatarGroup members={g.members} max={4} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(spent)}</span>
                  </div>
                  <ProgressBar value={spent} max={g.budget} height="sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent expenses */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Expenses</h2>
          <div className="card p-2">
            {recentExpenses.length === 0 ? (
              <EmptyState icon={<Receipt className="w-6 h-6" />} title="No expenses yet" description="Add your first expense to get started." />
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentExpenses.map((e) => {
                  const group = groups.find((g) => g.id === e.groupId);
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{group?.name} · {formatDateShort(e.date)}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">{formatCurrency(e.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4 text-center">
          <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900 dark:text-white">{groups.reduce((s, g) => s + g.members.length, 0)}</div>
          <div className="text-xs text-gray-500">Total Members</div>
        </div>
        <div className="card p-4 text-center">
          <Receipt className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900 dark:text-white">{expenses.length}</div>
          <div className="text-xs text-gray-500">Total Expenses</div>
        </div>
        <div className="card p-4 text-center">
          <Wallet className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-900 dark:text-white">{groups.length}</div>
          <div className="text-xs text-gray-500">Active Groups</div>
        </div>
      </div>
    </div>
  );
}
