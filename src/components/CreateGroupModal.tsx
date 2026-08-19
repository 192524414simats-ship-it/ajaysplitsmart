import { useState } from 'react';
import { Plane, Home as HomeIcon, Plus, X, Check } from 'lucide-react';
import * as api from '@/api';
import type { GroupMode, Member } from '@/types';
import { Modal } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { useRouter } from '@/router';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

const palette = ['#19b383', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#06b6d4'];

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const { navigate } = useRouter();
  const [mode, setMode] = useState<GroupMode | ''>('');
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { id: 'm1', name: 'Ajay', color: palette[0] },
  ]);
  const [newMember, setNewMember] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addMember() {
    if (!newMember.trim()) return;
    const id = 'm' + (members.length + 1) + Date.now().toString(36).slice(-4);
    setMembers([...members, { id, name: newMember.trim(), color: palette[members.length % palette.length] }]);
    setNewMember('');
  }

  function removeMember(id: string) {
    if (id === 'm1') return; // keep current user
    setMembers(members.filter((m) => m.id !== id));
  }

  async function handleSubmit() {
    setError('');
    if (!mode) { setError('Please choose Trip Mode or Shared Living.'); return; }
    if (!name.trim()) { setError('Please enter a group name.'); return; }
    if (members.length < 2) { setError('Add at least 2 members to the group.'); return; }
    const budgetNum = parseFloat(budget) || 0;

    setSaving(true);
    try {
      const group = await api.createGroup({
        name: name.trim(),
        mode,
        budget: budgetNum,
        startDate: mode === 'trip' ? startDate : undefined,
        endDate: mode === 'trip' ? endDate : undefined,
        members,
        currentMonth: mode === 'living' ? new Date().toISOString().slice(0, 7) : undefined,
      });
      onClose();
      resetForm();
      navigate(`/groups/${group.id}`);
    } catch (err: any) {
      setError(err.message || 'Unable to create group. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setMode('');
    setName('');
    setBudget('');
    setStartDate('');
    setEndDate('');
    setMembers([{ id: 'm1', name: 'Ajay', color: palette[0] }]);
    setNewMember('');
    setError('');
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a New Group" size="lg">
      <div className="space-y-5">
        {/* Mode selection */}
        <div>
          <label className="label">Choose a mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('trip')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                mode === 'trip'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <Plane className={`w-6 h-6 ${mode === 'trip' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Trip Mode</span>
            </button>
            <button
              onClick={() => setMode('living')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                mode === 'living'
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <HomeIcon className={`w-6 h-6 ${mode === 'living' ? 'text-brand-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Shared Living</span>
            </button>
          </div>
        </div>

        {/* Group name */}
        <div>
          <label className="label">Group Name</label>
          <input
            className="input"
            placeholder={mode === 'trip' ? 'e.g. Goa Trip 2026' : 'e.g. Apartment 4B'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Budget */}
        <div>
          <label className="label">Group Budget (₹)</label>
          <input
            type="number"
            className="input"
            placeholder="e.g. 20000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        {/* Dates for trip mode */}
        {mode === 'trip' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        )}

        {/* Members */}
        <div>
          <label className="label">Members</label>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <Avatar name={m.name} color={m.color} size="sm" />
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{m.name}</span>
                {m.id === 'm1' && <span className="text-xs text-gray-400">You</span>}
                {m.id !== 'm1' && (
                  <button onClick={() => removeMember(m.id)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              className="input"
              placeholder="Add member name..."
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember(); } }}
            />
            <button onClick={addMember} className="btn-secondary shrink-0">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Creating...' : <><Check className="w-4 h-4" /> Create Group</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
