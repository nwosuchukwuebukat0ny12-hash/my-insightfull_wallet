import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

  if (budgetAmount === 0) {
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
            onClick={() => {
              const amount = prompt('Enter your monthly budget:');
              if (amount && !isNaN(Number(amount))) {
                setBudget(Number(amount));
              }
            }}
            className="btn-primary"
          >
            Set Budget
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
            const amount = prompt('Enter your monthly budget:', String(budgetAmount));
            if (amount && !isNaN(Number(amount))) {
              setBudget(Number(amount));
            }
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

        <div className="budget-progress">
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
      </div>

      <p
        className={cn(
          'text-sm font-medium',
          isOverBudget && 'text-destructive',
          isNearLimit && 'text-warning',
          !isOverBudget && !isNearLimit && 'text-muted-foreground'
        )}
      >
        {getMessage()}
      </p>
    </div>
  );
};
