import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Expense, Budget, CategoryType, PaymentMethod, Income, IncomeSource } from '@/lib/types';
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/constants';
import { getCurrency, saveCurrency } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ExpenseContextType {
  expenses: Expense[];
  income: Income[];
  budget: Budget | null;
  currency: CurrencyCode;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  setBudget: (amount: number) => Promise<void>;
  setCurrency: (currency: CurrencyCode) => void;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch expenses from database
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      return;
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);

      // Prevent infinite toasts if the table doesn't exist yet or RLS fails
      if (error.code !== '42P01' && error.code !== 'PGRST116') {
        toast.error('Failed to load expenses');
      }
      setExpenses([]);
      return;
    }

    const mappedExpenses: Expense[] = (data || []).map((e) => ({
      id: e.id,
      name: e.name,
      amount: Number(e.amount),
      category: e.category as CategoryType,
      date: e.date,
      note: e.note || undefined,
      paymentMethod: e.payment_method as PaymentMethod | undefined,
      createdAt: e.created_at,
    }));

    setExpenses(mappedExpenses);
  }, [user]);

  // Fetch budget from database
  const fetchBudget = useCallback(async () => {
    if (!user) {
      setBudgetState(null);
      return;
    }

    const now = new Date();
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', now.getMonth())
      .eq('year', now.getFullYear())
      .maybeSingle();

    if (error) {
      console.error('Error fetching budget:', error);
      setBudgetState(null);
      return;
    }

    if (data) {
      setBudgetState({
        id: data.id,
        amount: Number(data.amount),
        month: data.month,
        year: data.year,
        categoryBudgets: data.category_budgets as Record<CategoryType, number> | undefined,
      });
    } else {
      setBudgetState(null);
    }
  }, [user]);

  // Fetch income from database
  const fetchIncome = useCallback(async () => {
    if (!user) {
      setIncome([]);
      return;
    }

    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching income:', error);
      if (error.code !== '42P01' && error.code !== 'PGRST116') {
        toast.error('Failed to load income');
      }
      setIncome([]);
      return;
    }

    const mappedIncome: Income[] = (data || []).map((i) => ({
      id: i.id,
      name: i.name,
      amount: Number(i.amount),
      source: i.source as IncomeSource,
      date: i.date,
      note: i.note || undefined,
      createdAt: i.created_at,
    }));

    setIncome(mappedIncome);
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setCurrencyState(getCurrency());

      if (user) {
        await Promise.all([fetchExpenses(), fetchBudget(), fetchIncome()]);
      } else {
        setExpenses([]);
        setIncome([]);
        setBudgetState(null);
      }

      setIsLoading(false);
    };

    loadData();
  }, [user, fetchExpenses, fetchBudget, fetchIncome]);

  const addExpenseHandler = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('You must be logged in to add expenses');
      return;
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        date: expenseData.date,
        note: expenseData.note || null,
        payment_method: expenseData.paymentMethod || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      return;
    }

    const newExpense: Expense = {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      category: data.category as CategoryType,
      date: data.date,
      note: data.note || undefined,
      paymentMethod: data.payment_method as PaymentMethod | undefined,
      createdAt: data.created_at,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    toast.success('Expense added');
  };

  const updateExpenseHandler = async (id: string, updates: Partial<Expense>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.note !== undefined) dbUpdates.note = updates.note || null;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod || null;

    const { error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
      return;
    }

    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
    toast.success('Expense updated');
  };

  const deleteExpenseHandler = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      return;
    }

    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    toast.success('Expense deleted');
  };

  const setBudgetHandler = async (amount: number) => {
    if (!user) {
      toast.error('You must be logged in to set a budget');
      return;
    }

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          amount,
          month,
          year,
        },
        { onConflict: 'user_id,month,year' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error setting budget:', error);
      toast.error('Failed to set budget');
      return;
    }

    setBudgetState({
      id: data.id,
      amount: Number(data.amount),
      month: data.month,
      year: data.year,
    });
    toast.success('Budget updated');
  };

  // Wrap setCurrencyHandler in useCallback so it's stable for useMemo
  const setCurrencyHandler = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    saveCurrency(newCurrency);
  }, []);

  // Wrap add, update, delete, setBudget handlers in useCallback to keep context stable
  const stableAddExpenseHandler = useCallback(addExpenseHandler, [user]);
  const stableUpdateExpenseHandler = useCallback(updateExpenseHandler, [user]);
  const stableDeleteExpenseHandler = useCallback(deleteExpenseHandler, [user]);
  const stableSetBudgetHandler = useCallback(setBudgetHandler, [user]);

  const addIncomeHandler = async (incomeData: Omit<Income, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('You must be logged in to add income');
      return;
    }

    const { data, error } = await supabase
      .from('income')
      .insert({
        user_id: user.id,
        name: incomeData.name,
        amount: incomeData.amount,
        source: incomeData.source,
        date: incomeData.date,
        note: incomeData.note || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income');
      return;
    }

    const newIncome: Income = {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      source: data.source as IncomeSource,
      date: data.date,
      note: data.note || undefined,
      createdAt: data.created_at,
    };

    setIncome((prev) => [newIncome, ...prev]);
    toast.success('Income added');
  };

  const deleteIncomeHandler = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting income:', error);
      toast.error('Failed to delete income');
      return;
    }

    setIncome((prev) => prev.filter((i) => i.id !== id));
    toast.success('Income deleted');
  };

  const stableAddIncomeHandler = useCallback(addIncomeHandler, [user]);
  const stableDeleteIncomeHandler = useCallback(deleteIncomeHandler, [user]);

  // Memoize context value to prevent full app re-renders on internal state changes
  const contextValue = useMemo(
    () => ({
      expenses,
      income,
      budget,
      currency,
      addExpense: stableAddExpenseHandler,
      updateExpense: stableUpdateExpenseHandler,
      deleteExpense: stableDeleteExpenseHandler,
      addIncome: stableAddIncomeHandler,
      deleteIncome: stableDeleteIncomeHandler,
      setBudget: stableSetBudgetHandler,
      setCurrency: setCurrencyHandler,
      isLoading,
    }),
    [
      expenses,
      income,
      budget,
      currency,
      isLoading,
      stableAddExpenseHandler,
      stableUpdateExpenseHandler,
      stableDeleteExpenseHandler,
      stableAddIncomeHandler,
      stableDeleteIncomeHandler,
      stableSetBudgetHandler,
      setCurrencyHandler
    ]
  );

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
