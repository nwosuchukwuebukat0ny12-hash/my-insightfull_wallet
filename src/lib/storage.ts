import { Expense, Budget } from './types';
import { CurrencyCode, DEFAULT_CURRENCY } from './constants';

const STORAGE_KEYS = {
  EXPENSES: 'expense_tracker_expenses',
  BUDGET: 'expense_tracker_budget',
  CURRENCY: 'expense_tracker_currency',
} as const;

// Expenses
export const getExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveExpenses = (expenses: Expense[]): void => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const addExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
};

export const updateExpense = (id: string, updates: Partial<Expense>): void => {
  const expenses = getExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updates };
    saveExpenses(expenses);
  }
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses();
  saveExpenses(expenses.filter((e) => e.id !== id));
};

// Budget
export const getBudget = (): Budget | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveBudget = (budget: Budget): void => {
  localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
};

// Currency
export const getCurrency = (): CurrencyCode => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return (data as CurrencyCode) || DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
};

export const saveCurrency = (currency: CurrencyCode): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
