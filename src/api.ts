import type {
  Group, Expense, Member, SplitMethod, SplitShare,
  CalculateSplitRequest, CalculateSplitResponse,
  CalculateBalanceRequest, CalculateBalanceResponse,
  SettlementRequest, SettlementResponse, SettlementPayment,
  WhatIfRequest, WhatIfResponse,
  Analytics,
} from './types';
import { demoGroups, demoExpenses, categoryColors, CURRENT_USER_ID } from './demoData';

// ============================================================
// SplitSmart API Service Layer
// ------------------------------------------------------------
// All communication with the C backend goes through this file.
// React components should NEVER call fetch() directly or perform
// expense calculations. They call these functions instead.
//
// When a real C backend is running at VITE_API_BASE_URL, set
// USE_MOCK=false (or remove the fallback) and all requests will
// be sent as JSON to the REST endpoints. The response shapes are
// defined in src/types.ts and must match what the C server returns.
//
// Until the C backend is connected, a demo-data layer provides
// realistic responses so the UI is fully functional for demos.
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Toggle this to false once the C backend is running.
const USE_MOCK = true;

// --- Simulated latency for realistic loading states ---
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// --- In-memory store for demo mode (mimics what SQLite would hold) ---
let store = {
  groups: [...demoGroups] as Group[],
  expenses: [...demoExpenses] as Expense[],
};

function genId(prefix: string): string {
  return prefix + Math.random().toString(36).slice(2, 10);
}

// ============================================================
// Generic HTTP helper — used when USE_MOCK is false
// ============================================================
async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    // Surface a user-friendly error; components will display it
    throw new Error('Unable to connect to the C backend.');
  }
}

// ============================================================
// GROUPS
// ============================================================
export async function getGroups(): Promise<Group[]> {
  if (USE_MOCK) { await delay(); return [...store.groups]; }
  return http<Group[]>('/api/groups');
}

export async function getGroup(id: string): Promise<Group | null> {
  if (USE_MOCK) { await delay(); return store.groups.find((g) => g.id === id) || null; }
  return http<Group>(`/api/groups/${id}`);
}

export async function createGroup(data: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
  if (USE_MOCK) {
    await delay();
    const group: Group = { ...data, id: genId('g'), createdAt: new Date().toISOString() };
    store.groups.push(group);
    return group;
  }
  return http<Group>('/api/groups', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateGroup(id: string, data: Partial<Group>): Promise<Group> {
  if (USE_MOCK) {
    await delay();
    const idx = store.groups.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Group not found');
    store.groups[idx] = { ...store.groups[idx], ...data };
    return store.groups[idx];
  }
  return http<Group>(`/api/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteGroup(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    store.groups = store.groups.filter((g) => g.id !== id);
    store.expenses = store.expenses.filter((e) => e.groupId !== id);
    return;
  }
  await http<void>(`/api/groups/${id}`, { method: 'DELETE' });
}

// ============================================================
// MEMBERS
// ============================================================
export async function addMember(groupId: string, name: string): Promise<Member> {
  const member: Member = { id: genId('m'), name, color: pickColor() };
  if (USE_MOCK) {
    await delay();
    const group = store.groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');
    group.members.push(member);
    return member;
  }
  return http<Member>('/api/members', {
    method: 'POST',
    body: JSON.stringify({ groupId, name }),
  });
}

export async function removeMember(groupId: string, memberId: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const group = store.groups.find((g) => g.id === groupId);
    if (!group) return;
    group.members = group.members.filter((m) => m.id !== memberId);
    return;
  }
  await http<void>(`/api/members/${memberId}`, { method: 'DELETE' });
}

const palette = ['#19b383', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#06b6d4'];
function pickColor(): string {
  return palette[Math.floor(Math.random() * palette.length)];
}

// ============================================================
// EXPENSES
// ============================================================
export async function getExpenses(groupId?: string): Promise<Expense[]> {
  if (USE_MOCK) {
    await delay();
    return groupId ? store.expenses.filter((e) => e.groupId === groupId) : [...store.expenses];
  }
  const query = groupId ? `?groupId=${groupId}` : '';
  return http<Expense[]>(`/api/expenses${query}`);
}

export async function createExpense(data: Omit<Expense, 'id'>): Promise<Expense> {
  if (USE_MOCK) {
    await delay();
    const expense: Expense = { ...data, id: genId('e') };
    store.expenses.push(expense);
    return expense;
  }
  return http<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
  if (USE_MOCK) {
    await delay();
    const idx = store.expenses.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Expense not found');
    store.expenses[idx] = { ...store.expenses[idx], ...data };
    return store.expenses[idx];
  }
  return http<Expense>(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteExpense(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    store.expenses = store.expenses.filter((e) => e.id !== id);
    return;
  }
  await http<void>(`/api/expenses/${id}`, { method: 'DELETE' });
}

// ============================================================
// CALCULATE SPLIT  →  POST /api/calculate-split
// The C backend performs all splitting math.
// ============================================================
export async function calculateSplit(req: CalculateSplitRequest): Promise<CalculateSplitResponse> {
  if (USE_MOCK) {
    await delay(250);
    return mockCalculateSplit(req);
  }
  return http<CalculateSplitResponse>('/api/calculate-split', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ============================================================
// CALCULATE BALANCE  →  POST /api/calculate-balance
// ============================================================
export async function calculateBalance(
  expenses: Expense[],
  members: Member[],
): Promise<CalculateBalanceResponse> {
  if (USE_MOCK) {
    await delay(300);
    return mockCalculateBalance(expenses, members);
  }
  return http<CalculateBalanceResponse>('/api/calculate-balance', {
    method: 'POST',
    body: JSON.stringify({ expenses, members } as CalculateBalanceRequest),
  });
}

// ============================================================
// SETTLEMENT  →  POST /api/settlement
// The C backend minimizes the number of transactions.
// ============================================================
export async function calculateSettlement(
  balances: { memberId: string; name: string; balance: number }[],
): Promise<SettlementResponse> {
  if (USE_MOCK) {
    await delay(350);
    return mockSettlement(balances);
  }
  return http<SettlementResponse>('/api/settlement', {
    method: 'POST',
    body: JSON.stringify({ balances } as SettlementRequest),
  });
}

// ============================================================
// WHAT-IF  →  POST /api/what-if
// ============================================================
export async function whatIf(req: WhatIfRequest): Promise<WhatIfResponse> {
  if (USE_MOCK) {
    await delay(400);
    return mockWhatIf(req);
  }
  return http<WhatIfResponse>('/api/what-if', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ============================================================
// BUDGET  →  POST /api/budget
// ============================================================
export async function setBudget(groupId: string, budget: number): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const group = store.groups.find((g) => g.id === groupId);
    if (group) group.budget = budget;
    return;
  }
  await http<void>('/api/budget', { method: 'POST', body: JSON.stringify({ groupId, budget }) });
}

// ============================================================
// ANALYTICS  →  GET /api/analytics
// ============================================================
export async function getAnalytics(groupId: string): Promise<Analytics> {
  if (USE_MOCK) {
    await delay(350);
    return mockAnalytics(groupId);
  }
  return http<Analytics>(`/api/analytics?groupId=${groupId}`);
}

// ============================================================
// SETTLEMENT — mark payment as done
// ============================================================
export async function markSettlementPaid(
  groupId: string,
  fromId: string,
  toId: string,
): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    // In demo mode, settlement marking is handled in-memory by the UI.
    // A real backend would persist this in SQLite.
    return;
  }
  await http<void>('/api/settlement/mark-paid', {
    method: 'POST',
    body: JSON.stringify({ groupId, from: fromId, to: toId }),
  });
}

// ============================================================
// MOCK IMPLEMENTATIONS
// ------------------------------------------------------------
// These exist ONLY so the frontend is demonstrable before the
// C backend is connected. They replicate the expected API
// response shapes. When the C backend is ready, set USE_MOCK
// to false and delete this entire section — the real HTTP
// calls above will take over.
// ============================================================

function mockCalculateSplit(req: CalculateSplitRequest): CalculateSplitResponse {
  const { amount, method, members } = req;
  const shares: SplitShare[] = [];

  switch (method) {
    case 'equal': {
      const per = Math.round((amount / members.length) * 100) / 100;
      let remaining = amount;
      members.forEach((m, i) => {
        const shareAmt = i === members.length - 1
          ? Math.round((amount - per * (members.length - 1)) * 100) / 100
          : per;
        remaining -= shareAmt;
        shares.push({ memberId: m.id, name: m.name, amount: shareAmt });
      });
      break;
    }
    case 'custom': {
      members.forEach((m) => {
        shares.push({ memberId: m.id, name: m.name, amount: m.amount || 0 });
      });
      break;
    }
    case 'percentage': {
      members.forEach((m) => {
        const amt = Math.round((amount * (m.percentage || 0)) / 100 * 100) / 100;
        shares.push({ memberId: m.id, name: m.name, amount: amt, percentage: m.percentage });
      });
      break;
    }
    case 'usage': {
      const totalUnits = members.reduce((s, m) => s + (m.units || 0), 0);
      if (totalUnits === 0) {
        members.forEach((m) => shares.push({ memberId: m.id, name: m.name, amount: 0, units: m.units }));
        break;
      }
      const costPerUnit = amount / totalUnits;
      let allocated = 0;
      members.forEach((m, i) => {
        const units = m.units || 0;
        const amt = i === members.length - 1
          ? Math.round((amount - allocated) * 100) / 100
          : Math.round(units * costPerUnit * 100) / 100;
        allocated += amt;
        shares.push({ memberId: m.id, name: m.name, amount: amt, units });
      });
      break;
    }
    case 'selected': {
      const per = Math.round((amount / members.length) * 100) / 100;
      let allocated = 0;
      members.forEach((m, i) => {
        const amt = i === members.length - 1
          ? Math.round((amount - allocated) * 100) / 100
          : per;
        allocated += amt;
        shares.push({ memberId: m.id, name: m.name, amount: amt });
      });
      break;
    }
  }

  return { shares };
}

function mockCalculateBalance(expenses: Expense[], members: Member[]): CalculateBalanceResponse {
  const balances = members.map((m) => ({
    memberId: m.id,
    name: m.name,
    paid: 0,
    owed: 0,
    balance: 0,
  }));

  expenses.forEach((e) => {
    const payer = balances.find((b) => b.memberId === e.paidBy);
    if (payer) payer.paid += e.amount;
    e.shares.forEach((s) => {
      const member = balances.find((b) => b.memberId === s.memberId);
      if (member) member.owed += s.amount;
    });
  });

  balances.forEach((b) => {
    b.paid = Math.round(b.paid * 100) / 100;
    b.owed = Math.round(b.owed * 100) / 100;
    b.balance = Math.round((b.paid - b.owed) * 100) / 100;
  });

  return { balances };
}

function mockSettlement(balances: { memberId: string; name: string; balance: number }[]): SettlementResponse {
  // Greedy settlement: pair largest debtor with largest creditor.
  const debtors = balances.filter((b) => b.balance < 0)
    .map((b) => ({ ...b, balance: -b.balance }))
    .sort((a, b) => b.balance - a.balance);
  const creditors = balances.filter((b) => b.balance > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance);

  const payments: SettlementPayment[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amt = Math.round(Math.min(d.balance, c.balance) * 100) / 100;
    if (amt > 0) {
      payments.push({
        from: d.memberId, fromName: d.name,
        to: c.memberId, toName: c.name,
        amount: amt, paid: false,
      });
    }
    d.balance -= amt;
    c.balance -= amt;
    if (d.balance < 0.01) i++;
    if (c.balance < 0.01) j++;
  }

  return { payments, count: payments.length };
}

function mockWhatIf(req: WhatIfRequest): WhatIfResponse {
  const current = mockCalculateBalance(req.expenses, req.members).balances;
  const hypotheticalExpense: Expense = {
    id: 'whatif',
    groupId: '',
    name: req.hypothetical.name,
    amount: req.hypothetical.amount,
    date: new Date().toISOString().slice(0, 10),
    category: 'Other',
    paidBy: req.hypothetical.paidBy,
    paidByName: req.members.find((m) => m.id === req.hypothetical.paidBy)?.name || '',
    splitMethod: req.hypothetical.splitMethod,
    shares: req.hypothetical.shares,
  };
  const newExpenses = [...req.expenses, hypotheticalExpense];
  const projected = mockCalculateBalance(newExpenses, req.members).balances;

  const differences = current.map((c) => {
    const n = projected.find((p) => p.memberId === c.memberId)!;
    return {
      memberId: c.memberId,
      name: c.name,
      current: c.balance,
      projected: n.balance,
      change: Math.round((n.balance - c.balance) * 100) / 100,
    };
  });

  return { result: { currentBalances: current, newBalances: projected, differences } };
}

function mockAnalytics(groupId: string): Analytics {
  const group = store.groups.find((g) => g.id === groupId);
  if (!group) {
    return { totalSpending: 0, categoryBreakdown: [], memberContributions: [], monthlySpending: [], budgetUsage: { budget: 0, spent: 0, remaining: 0 } };
  }
  const expenses = store.expenses.filter((e) => e.groupId === groupId);
  const totalSpending = expenses.reduce((s, e) => s + e.amount, 0);

  const catMap: Record<string, number> = {};
  expenses.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const categoryBreakdown = Object.entries(catMap).map(([category, amount]) => ({
    category, amount, color: categoryColors[category] || '#6b7280',
  }));

  const memberContributions = group.members.map((m) => {
    const paid = expenses.filter((e) => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0);
    const share = expenses.reduce((s, e) => s + e.shares.filter((sh) => sh.memberId === m.id).reduce((ss, sh) => ss + sh.amount, 0), 0);
    return { memberId: m.id, name: m.name, paid, share };
  });

  const monthMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const month = e.date.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + e.amount;
  });
  const monthlySpending = Object.entries(monthMap).sort().map(([month, amount]) => ({ month, amount }));

  return {
    totalSpending,
    categoryBreakdown,
    memberContributions,
    monthlySpending,
    budgetUsage: { budget: group.budget, spent: totalSpending, remaining: group.budget - totalSpending },
  };
}

// ============================================================
// Helper: get current user's perspective
// ============================================================
export function getCurrentUserId(): string {
  return CURRENT_USER_ID;
}
