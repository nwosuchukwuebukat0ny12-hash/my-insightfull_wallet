import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '@/lib/constants';
import { CategoryType } from '@/lib/types';

export const BudgetProgress = () => {
  const { expenses, budget, currency, setBudget } = useExpenses();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter expenses for current month
  const monthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetAmount = budget?.amount || 0;
  const remaining = budgetAmount - totalSpent;
  const percentage = budgetAmount > 0 ? Math.min(100, (totalSpent / budgetAmount) * 100) : 0;

  const isOverBudget = remaining < 0;
  const isNearLimit = percentage >= 80 && percentage < 100;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-gradient-to-r from-destructive to-destructive/80';
    if (isNearLimit) return 'bg-gradient-to-r from-warning to-warning/80';
    return 'budget-progress-bar';
  };

  const getMessage = () => {
    if (budgetAmount === 0) return "Set a budget to track your spending";
    if (isOverBudget) return `You've exceeded your budget by ${formatCurrency(Math.abs(remaining), currency)}`;
    if (isNearLimit) return "You're getting close to your budget limit";
    return `You have ${formatCurrency(remaining, currency)} left to spend`;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [categoryAmounts, setCategoryAmounts] = useState<Record<CategoryType, string>>(() => {
    const initial = {} as Record<CategoryType, string>;
    CATEGORIES.forEach(cat => {
      initial[cat.id] = (budget?.categoryBudgets?.[cat.id] || 0).toString();
    });
    return initial;
  });

  // Update categoryAmounts when budget changes
  useEffect(() => {
    if (budget?.categoryBudgets) {
      const initial = {} as Record<CategoryType, string>;
      CATEGORIES.forEach(cat => {
        initial[cat.id] = (budget.categoryBudgets?.[cat.id] || 0).toString();
      });
      setCategoryAmounts(initial);
    }
  }, [budget]);

  const totalEditAmount = useMemo(() => {
    return Object.values(categoryAmounts).reduce((sum, val) => {
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [categoryAmounts]);

  const handleSave = () => {
    const parsedCategoryBudgets = {} as Record<CategoryType, number>;
    Object.entries(categoryAmounts).forEach(([cat, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        parsedCategoryBudgets[cat as CategoryType] = num;
      }
    });
    setBudget(totalEditAmount, parsedCategoryBudgets);
    setIsEditing(false);
  };

  if (budgetAmount === 0 && !isEditing) {
    return (
      <div className="glass-card p-6 animate-slide-up stagger-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Monthly Budget</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-muted-foreground mb-4">No budget set for this month</p>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Set Budget
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="glass-card p-6 animate-slide-up stagger-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Set Category Budgets</h3>
          <button
            onClick={() => setIsEditing(false)}
            className="btn-ghost text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-32">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={categoryAmounts[cat.id]}
                  onChange={(e) => setCategoryAmounts(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  className="input-field pl-12 w-full text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Monthly Budget</p>
            <p className="text-lg font-bold">{formatCurrency(totalEditAmount, currency)}</p>
          </div>
          <button
            onClick={handleSave}
            className="btn-primary px-8"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-slide-up stagger-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-display">Monthly Budget</h3>
        <button
          onClick={() => {
            setIsEditing(true);
          }}
          className="btn-ghost text-sm"
        >
          Edit
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-2xl font-bold font-display">{formatCurrency(totalSpent, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="text-lg font-semibold">{formatCurrency(budgetAmount, currency)}</p>
          </div>
        </div>

        <div className="budget-progress h-3 mb-6">
          <div
            className={cn('h-full rounded-full transition-all duration-700 ease-out', getProgressColor())}
            style={{
              width: `${percentage}%`,
              boxShadow: isOverBudget
                ? '0 0 12px hsl(var(--destructive) / 0.5)'
                : isNearLimit
                  ? '0 0 12px hsl(var(--warning) / 0.5)'
                  : '0 0 12px hsl(var(--primary) / 0.5)'
            }}
          />
        </div>

        <p
          className={cn(
            'text-sm font-medium mb-2',
            isOverBudget && 'text-destructive',
            isNearLimit && 'text-warning',
            !isOverBudget && !isNearLimit && 'text-muted-foreground'
          )}
        >
          {getMessage()}
        </p>
      </div>
    </div>
  );
};
