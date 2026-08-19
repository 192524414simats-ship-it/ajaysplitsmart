import type { Group, Expense } from './types';

// Demo data so the UI is populated immediately.
// This is NOT business logic — just realistic seed data for demonstration.
// A real C backend would serve this from SQLite.

export const CURRENT_USER_ID = 'm1';

export const demoGroups: Group[] = [
  {
    id: 'g1',
    name: 'Goa Trip 2026',
    mode: 'trip',
    budget: 20000,
    startDate: '2026-01-10',
    endDate: '2026-01-14',
    createdAt: '2026-01-05T10:00:00Z',
    members: [
      { id: 'm1', name: 'Ajay', color: '#19b383' },
      { id: 'm2', name: 'Rahul', color: '#3b82f6' },
      { id: 'm3', name: 'Arun', color: '#f59e0b' },
      { id: 'm4', name: 'Kiran', color: '#8b5cf6' },
    ],
  },
  {
    id: 'g2',
    name: 'Apartment 4B',
    mode: 'living',
    budget: 15000,
    createdAt: '2026-08-01T10:00:00Z',
    currentMonth: '2026-08',
    members: [
      { id: 'm1', name: 'Ajay', color: '#19b383' },
      { id: 'm2', name: 'Rahul', color: '#3b82f6' },
      { id: 'm3', name: 'Arun', color: '#f59e0b' },
      { id: 'm4', name: 'Kiran', color: '#8b5cf6' },
    ],
  },
  {
    id: 'g3',
    name: 'Ooty Trip 2026',
    mode: 'trip',
    budget: 12000,
    startDate: '2026-03-20',
    endDate: '2026-03-23',
    createdAt: '2026-03-15T10:00:00Z',
    members: [
      { id: 'm1', name: 'Ajay', color: '#19b383' },
      { id: 'm2', name: 'Rahul', color: '#3b82f6' },
      { id: 'm3', name: 'Arun', color: '#f59e0b' },
    ],
  },
];

export const demoExpenses: Expense[] = [
  // Goa Trip
  {
    id: 'e1', groupId: 'g1', name: 'Hotel Booking', amount: 6000, date: '2026-01-10',
    category: 'Hotel', paidBy: 'm1', paidByName: 'Ajay', splitMethod: 'selected',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 2000 },
      { memberId: 'm2', name: 'Rahul', amount: 2000 },
      { memberId: 'm3', name: 'Arun', amount: 2000 },
    ],
    notes: '3-night stay, 3 people shared the room',
  },
  {
    id: 'e2', groupId: 'g1', name: 'Dinner at Tito\'s', amount: 2000, date: '2026-01-10',
    category: 'Food', paidBy: 'm2', paidByName: 'Rahul', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 500 },
      { memberId: 'm2', name: 'Rahul', amount: 500 },
      { memberId: 'm3', name: 'Arun', amount: 500 },
      { memberId: 'm4', name: 'Kiran', amount: 500 },
    ],
  },
  {
    id: 'e3', groupId: 'g1', name: 'Fuel', amount: 2400, date: '2026-01-11',
    category: 'Fuel', paidBy: 'm1', paidByName: 'Ajay', splitMethod: 'usage',
    unitLabel: 'km driven',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 960, units: 40 },
      { memberId: 'm2', name: 'Rahul', amount: 720, units: 30 },
      { memberId: 'm3', name: 'Arun', amount: 480, units: 20 },
      { memberId: 'm4', name: 'Kiran', amount: 240, units: 10 },
    ],
  },
  {
    id: 'e4', groupId: 'g1', name: 'Beach Activity', amount: 1600, date: '2026-01-12',
    category: 'Activities', paidBy: 'm3', paidByName: 'Arun', splitMethod: 'percentage',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 640, percentage: 40 },
      { memberId: 'm2', name: 'Rahul', amount: 480, percentage: 30 },
      { memberId: 'm3', name: 'Arun', amount: 320, percentage: 20 },
      { memberId: 'm4', name: 'Kiran', amount: 160, percentage: 10 },
    ],
  },
  {
    id: 'e5', groupId: 'g1', name: 'Breakfast', amount: 800, date: '2026-01-13',
    category: 'Food', paidBy: 'm4', paidByName: 'Kiran', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 200 },
      { memberId: 'm2', name: 'Rahul', amount: 200 },
      { memberId: 'm3', name: 'Arun', amount: 200 },
      { memberId: 'm4', name: 'Kiran', amount: 200 },
    ],
  },
  // Apartment 4B
  {
    id: 'e6', groupId: 'g2', name: 'August Rent', amount: 8000, date: '2026-08-01',
    category: 'Rent', paidBy: 'm1', paidByName: 'Ajay', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 2000 },
      { memberId: 'm2', name: 'Rahul', amount: 2000 },
      { memberId: 'm3', name: 'Arun', amount: 2000 },
      { memberId: 'm4', name: 'Kiran', amount: 2000 },
    ],
  },
  {
    id: 'e7', groupId: 'g2', name: 'Electricity Bill', amount: 2400, date: '2026-08-05',
    category: 'Electricity', paidBy: 'm2', paidByName: 'Rahul', splitMethod: 'usage',
    unitLabel: 'units',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 960, units: 40 },
      { memberId: 'm2', name: 'Rahul', amount: 720, units: 30 },
      { memberId: 'm3', name: 'Arun', amount: 480, units: 20 },
      { memberId: 'm4', name: 'Kiran', amount: 240, units: 10 },
    ],
  },
  {
    id: 'e8', groupId: 'g2', name: 'Internet', amount: 1000, date: '2026-08-05',
    category: 'Internet', paidBy: 'm3', paidByName: 'Arun', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 250 },
      { memberId: 'm2', name: 'Rahul', amount: 250 },
      { memberId: 'm3', name: 'Arun', amount: 250 },
      { memberId: 'm4', name: 'Kiran', amount: 250 },
    ],
  },
  {
    id: 'e9', groupId: 'g2', name: 'Groceries', amount: 3000, date: '2026-08-10',
    category: 'Groceries', paidBy: 'm1', paidByName: 'Ajay', splitMethod: 'custom',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 1000 },
      { memberId: 'm2', name: 'Rahul', amount: 800 },
      { memberId: 'm3', name: 'Arun', amount: 700 },
      { memberId: 'm4', name: 'Kiran', amount: 500 },
    ],
    notes: 'Monthly grocery haul',
  },
  {
    id: 'e10', groupId: 'g2', name: 'Gas Cylinder', amount: 800, date: '2026-08-12',
    category: 'Gas', paidBy: 'm4', paidByName: 'Kiran', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 200 },
      { memberId: 'm2', name: 'Rahul', amount: 200 },
      { memberId: 'm3', name: 'Arun', amount: 200 },
      { memberId: 'm4', name: 'Kiran', amount: 200 },
    ],
  },
  // Ooty Trip (archived — fewer expenses)
  {
    id: 'e11', groupId: 'g3', name: 'Cab to Resort', amount: 1500, date: '2026-03-20',
    category: 'Transport', paidBy: 'm1', paidByName: 'Ajay', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 500 },
      { memberId: 'm2', name: 'Rahul', amount: 500 },
      { memberId: 'm3', name: 'Arun', amount: 500 },
    ],
  },
  {
    id: 'e12', groupId: 'g3', name: 'Resort Stay', amount: 4500, date: '2026-03-20',
    category: 'Hotel', paidBy: 'm2', paidByName: 'Rahul', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 1500 },
      { memberId: 'm2', name: 'Rahul', amount: 1500 },
      { memberId: 'm3', name: 'Arun', amount: 1500 },
    ],
  },
  {
    id: 'e13', groupId: 'g3', name: 'Sightseeing Tour', amount: 900, date: '2026-03-21',
    category: 'Activities', paidBy: 'm3', paidByName: 'Arun', splitMethod: 'equal',
    shares: [
      { memberId: 'm1', name: 'Ajay', amount: 300 },
      { memberId: 'm2', name: 'Rahul', amount: 300 },
      { memberId: 'm3', name: 'Arun', amount: 300 },
    ],
  },
];

export const tripCategories = [
  'Food', 'Hotel', 'Transport', 'Fuel', 'Tickets', 'Activities', 'Shopping', 'Other',
];

export const livingCategories = [
  'Rent', 'Electricity', 'Water', 'Internet', 'Groceries', 'Gas', 'Cleaning', 'Household', 'Subscriptions', 'Other',
];

export const categoryColors: Record<string, string> = {
  Food: '#19b383', Hotel: '#3b82f6', Transport: '#f59e0b', Fuel: '#ef4444',
  Tickets: '#8b5cf6', Activities: '#ec4899', Shopping: '#14b8a6', Other: '#6b7280',
  Rent: '#3b82f6', Electricity: '#f59e0b', Water: '#06b6d4', Internet: '#8b5cf6',
  Groceries: '#19b383', Gas: '#ef4444', Cleaning: '#14b8a6', Household: '#ec4899',
  Subscriptions: '#f97316',
};
