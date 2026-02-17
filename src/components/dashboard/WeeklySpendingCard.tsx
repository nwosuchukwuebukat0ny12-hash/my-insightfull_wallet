import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency, filterExpensesByPeriod, calculateTotal, calculateChangePercentage } from '@/lib/utils';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';

export const WeeklySpendingCard = () => {
  const { expenses, currency } = useExpenses();
  
  const now = new Date();
  const weekExpenses = filterExpensesByPeriod(expenses, 'week');
  const totalThisWeek = calculateTotal(weekExpenses);
  
  // Calculate previous week spending
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  
  const previousWeekExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= lastWeekStart && expenseDate <= lastWeekEnd;
  });
  
  const previousWeekTotal = calculateTotal(previousWeekExpenses);
  const changePercentage = calculateChangePercentage(totalThisWeek, previousWeekTotal);
  const trend = changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'neutral';

  return (
    <div className="stat-card-primary animate-slide-up stagger-2">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-primary/20">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        {trend !== 'neutral' && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
              trend === 'up' && 'bg-destructive/15 text-destructive',
              trend === 'down' && 'bg-success/15 text-success'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(changePercentage).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">This Week</p>
      <p className="text-2xl font-bold font-display tracking-tight">
        {formatCurrency(totalThisWeek, currency)}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        vs {formatCurrency(previousWeekTotal, currency)} last week
      </p>
    </div>
  );
};
