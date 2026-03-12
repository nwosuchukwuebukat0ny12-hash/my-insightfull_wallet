export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: CategoryType;
  date: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export type CategoryType =
  | 'food'
  | 'transport'
  | 'rent'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'education'
  | 'savings'
  | 'other';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_money';

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryBudgets?: Record<CategoryType, number>;
}

export interface DashboardStats {
  totalThisMonth: number;
  todaySpending: number;
  remainingBudget: number;
  budgetPercentage: number;
  previousMonthTotal: number;
  changePercentage: number;
}

export interface CategorySpending {
  category: CategoryType;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export type IncomeSource = 'salary' | 'freelance' | 'gift' | 'investment' | 'other' | (string & {});

export interface Income {
  id: string;
  name: string;
  amount: number;
  source: IncomeSource;
  date: string;
  note?: string;
  createdAt: string;
}
