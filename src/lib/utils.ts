import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Expense, CategorySpending, DailySpending, CategoryType } from "./types";
import { CURRENCIES, CurrencyCode } from "./constants";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, isWithinInterval, format, subMonths, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currencyCode: CurrencyCode = 'USD'): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol || '$';
  
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
};

export const formatDateShort = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'MMM d');
};

// Filter expenses by time period
export const filterExpensesByPeriod = (
  expenses: Expense[],
  period: 'today' | 'week' | 'month' | 'all',
  date: Date = new Date()
): Expense[] => {
  if (period === 'all') return expenses;

  const intervals: Record<string, { start: Date; end: Date }> = {
    today: { start: startOfDay(date), end: endOfDay(date) },
    week: { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) },
    month: { start: startOfMonth(date), end: endOfMonth(date) },
  };

  const interval = intervals[period];
  
  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, interval);
  });
};

// Calculate total
export const calculateTotal = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Get spending by category
export const getSpendingByCategory = (expenses: Expense[]): CategorySpending[] => {
  const total = calculateTotal(expenses);
  const categoryMap = new Map<CategoryType, number>();

  expenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, current + expense.amount);
  });

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

// Get daily spending for the current month
export const getDailySpending = (expenses: Expense[], month: Date = new Date()): DailySpending[] => {
  const monthExpenses = filterExpensesByPeriod(expenses, 'month', month);
  const dailyMap = new Map<string, number>();

  monthExpenses.forEach((expense) => {
    const dateKey = format(parseISO(expense.date), 'yyyy-MM-dd');
    const current = dailyMap.get(dateKey) || 0;
    dailyMap.set(dateKey, current + expense.amount);
  });

  return Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Get previous month spending
export const getPreviousMonthSpending = (expenses: Expense[]): number => {
  const lastMonth = subMonths(new Date(), 1);
  const filtered = filterExpensesByPeriod(expenses, 'month', lastMonth);
  return calculateTotal(filtered);
};

// Calculate change percentage
export const calculateChangePercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
