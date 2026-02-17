import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Budget, CategoryType, PaymentMethod } from '@/lib/types';
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/constants';
import { getCurrency, saveCurrency } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ExpenseContextType {
  expenses: Expense[];
  budget: Budget | null;
  currency: CurrencyCode;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBudget: (amount: number) => Promise<void>;
  setCurrency: (currency: CurrencyCode) => void;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch expenses from database
  const fetchExpenses = async () => {
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
      toast.error('Failed to load expenses');
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
  };

  // Fetch budget from database
  const fetchBudget = async () => {
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
  };

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setCurrencyState(getCurrency());
      
      if (user) {
        await Promise.all([fetchExpenses(), fetchBudget()]);
      } else {
        setExpenses([]);
        setBudgetState(null);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [user]);

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

  const setCurrencyHandler = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    saveCurrency(newCurrency);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budget,
        currency,
        addExpense: addExpenseHandler,
        updateExpense: updateExpenseHandler,
        deleteExpense: deleteExpenseHandler,
        setBudget: setBudgetHandler,
        setCurrency: setCurrencyHandler,
        isLoading,
      }}
    >
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
