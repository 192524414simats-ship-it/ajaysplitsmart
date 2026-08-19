import { useEffect, useState } from 'react';
import { History, Plane, Home as HomeIcon, ChevronRight, Calendar } from 'lucide-react';
import * as api from '@/api';
import type { Group, Expense } from '@/types';
import { formatCurrency, formatDate, monthLabel } from '@/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/Feedback';
import { AvatarGroup } from '@/components/Avatar';
import { useRouter } from '@/router';

export function GroupHistory() {
  const { navigate } = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenseCounts, setExpenseCounts] = useState<Record<string, { count: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const gs = await api.getGroups();
      const allExpenses = await api.getExpenses();
      const map: Record<string, { count: number; total: number }> = {};
      gs.forEach((g) => {
        const gExpenses = allExpenses.filter((e) => e.groupId === g.id);
        map[g.id] = {
          count: gExpenses.length,
          total: gExpenses.reduce((s, e) => s + e.amount, 0),
        };
      });
      setGroups(gs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setExpenseCounts(map);
    } catch (err: any) {
      setError(err.message || 'Unable to load history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState label="Loading history..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">All your past and present groups with full expense history</p>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={<History className="w-6 h-6" />} title="No groups yet" description="Your group history will appear here once you create groups." />
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const Icon = g.mode === 'trip' ? Plane : HomeIcon;
            const stats = expenseCounts[g.id] || { count: 0, total: 0 };
            return (
              <button
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="card p-5 w-full text-left hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${g.mode === 'trip' ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-brand-50 dark:bg-brand-950/40'}`}>
                  <Icon className={`w-6 h-6 ${g.mode === 'trip' ? 'text-blue-500' : 'text-brand-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{g.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <span className="capitalize">{g.mode === 'trip' ? 'Trip' : 'Shared Living'}</span>
                    <span>·</span>
                    <span>{g.members.length} members</span>
                    <span>·</span>
                    <span>{stats.count} expenses</span>
                    {g.startDate && <><span>·</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(g.startDate)}</span></>}
                    {g.currentMonth && <><span>·</span><span>{monthLabel(g.currentMonth)}</span></>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.total)}</div>
                  <div className="text-xs text-gray-500">total spent</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
