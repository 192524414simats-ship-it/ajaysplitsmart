// Core domain types for SplitSmart.
// These mirror the JSON shapes the C backend will send/receive.

export type GroupMode = 'trip' | 'living';

export type SplitMethod = 'equal' | 'custom' | 'percentage' | 'usage' | 'selected';

export interface Member {
  id: string;
  name: string;
  color?: string;
}

export interface Group {
  id: string;
  name: string;
  mode: GroupMode;
  budget: number;
  startDate?: string;
  endDate?: string;
  members: Member[];
  createdAt: string;
  // Shared living: which month is being tracked (YYYY-MM)
  currentMonth?: string;
}

export interface SplitShare {
  memberId: string;
  name: string;
  amount: number;
  // For usage-based: units consumed
  units?: number;
  // For percentage-based
  percentage?: number;
}

export interface Expense {
  id: string;
  groupId: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  paidBy: string; // memberId
  paidByName: string;
  splitMethod: SplitMethod;
  shares: SplitShare[];
  notes?: string;
  // For usage-based: the unit label (e.g. "units", "kg")
  unitLabel?: string;
}

export interface BalanceEntry {
  memberId: string;
  name: string;
  paid: number;
  owed: number;
  balance: number; // positive = should receive, negative = should pay
}

export interface SettlementPayment {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
  paid: boolean;
}

export interface WhatIfResult {
  currentBalances: BalanceEntry[];
  newBalances: BalanceEntry[];
  differences: { memberId: string; name: string; current: number; projected: number; change: number }[];
}

export interface Analytics {
  totalSpending: number;
  categoryBreakdown: { category: string; amount: number; color: string }[];
  memberContributions: { memberId: string; name: string; paid: number; share: number }[];
  monthlySpending: { month: string; amount: number }[];
  budgetUsage: { budget: number; spent: number; remaining: number };
}

// --- API request shapes ---

export interface CalculateSplitRequest {
  amount: number;
  method: SplitMethod;
  members: { id: string; name: string; percentage?: number; units?: number; amount?: number }[];
  unitLabel?: string;
}

export interface CalculateSplitResponse {
  shares: SplitShare[];
}

export interface CalculateBalanceRequest {
  expenses: Expense[];
  members: Member[];
}

export interface CalculateBalanceResponse {
  balances: BalanceEntry[];
}

export interface SettlementRequest {
  balances: BalanceEntry[];
}

export interface SettlementResponse {
  payments: SettlementPayment[];
  count: number;
}

export interface WhatIfRequest {
  expenses: Expense[];
  members: Member[];
  hypothetical: {
    name: string;
    amount: number;
    paidBy: string;
    splitMethod: SplitMethod;
    shares: SplitShare[];
  };
}

export interface WhatIfResponse {
  result: WhatIfResult;
}
