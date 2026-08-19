import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import * as api from '@/api';
import type { Analytics } from '@/types';
import { formatCurrency } from '@/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/Feedback';
import { Receipt, TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';

export function GroupAnalytics({ groupId }: { groupId: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAnalytics(groupId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [groupId]);

  if (loading) return <LoadingState label="Loading analytics..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data || data.totalSpending === 0) return (
    <EmptyState icon={<BarChart3 className="w-6 h-6" />} title="No data to analyze" description="Add some expenses to see analytics." />
  );

  const budgetPct = data.budgetUsage.budget > 0 ? (data.budgetUsage.spent / data.budgetUsage.budget) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Total Spending</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.totalSpending)}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Budget Used</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(budgetPct)}%</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Categories</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{data.categoryBreakdown.length}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Members</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{data.memberContributions.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Category breakdown - donut */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.categoryBreakdown}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Member contributions - bar */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Member Contributions</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.memberContributions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="paid" name="Paid" fill="#19b383" radius={[6, 6, 0, 0]} />
              <Bar dataKey="share" name="Owes" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly spending - line */}
        {data.monthlySpending.length > 0 && (
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Spending Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#19b383"
                  strokeWidth={3}
                  dot={{ fill: '#19b383', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Budget usage */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Budget Usage</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Spent</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.budgetUsage.spent)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Budget</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.budgetUsage.budget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Remaining</span>
              <span className={`font-semibold ${data.budgetUsage.remaining < 0 ? 'text-red-500' : 'text-brand-600'}`}>
                {formatCurrency(data.budgetUsage.remaining)}
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetPct > 100 ? 'bg-red-500' : 'bg-brand-500'}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
