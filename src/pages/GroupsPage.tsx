import { useEffect, useState } from 'react';
import { Plane, Home as HomeIcon, Plus, Users, Receipt, ChevronRight, Trash2 } from 'lucide-react';
import * as api from '@/api';
import type { Group } from '@/types';
import { formatCurrency } from '@/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/Feedback';
import { AvatarGroup } from '@/components/Avatar';
import { useRouter } from '@/router';

export function GroupsPage({ onAddGroup }: { onAddGroup: () => void }) {
  const { navigate } = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const gs = await api.getGroups();
      setGroups(gs);
      const allExpenses = await api.getExpenses();
      const map: Record<string, number> = {};
      gs.forEach((g) => {
        map[g.id] = allExpenses.filter((e) => e.groupId === g.id).reduce((s, e) => s + e.amount, 0);
      });
      setExpenses(map);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the C backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this group and all its expenses? This cannot be undone.')) return;
    await api.deleteGroup(id);
    load();
  }

  if (loading) return <LoadingState label="Loading groups..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Groups</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and track all your expense groups</p>
        </div>
        <button onClick={onAddGroup} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No groups yet"
          description="Create your first group to start tracking shared expenses."
          action={<button onClick={onAddGroup} className="btn-primary mt-2"><Plus className="w-4 h-4" /> Create Group</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => {
            const Icon = g.mode === 'trip' ? Plane : HomeIcon;
            const spent = expenses[g.id] || 0;
            return (
              <div
                key={g.id}
                className="card p-5 hover:shadow-soft transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <button onClick={() => navigate(`/groups/${g.id}`)} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${g.mode === 'trip' ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-brand-50 dark:bg-brand-950/40'}`}>
                      <Icon className={`w-5 h-5 ${g.mode === 'trip' ? 'text-blue-500' : 'text-brand-500'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{g.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{g.mode === 'trip' ? 'Trip Mode' : 'Shared Living'}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => navigate(`/groups/${g.id}`)} className="block w-full text-left">
                  <div className="flex items-center justify-between mb-3">
                    <AvatarGroup members={g.members} max={4} />
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(spent)}</div>
                      <div className="text-xs text-gray-500">of {formatCurrency(g.budget)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {g.members.length}</span>
                    <span className="flex items-center gap-1"><Receipt className="w-3 h-3" /> {spent > 0 ? 'View details' : 'No expenses'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
