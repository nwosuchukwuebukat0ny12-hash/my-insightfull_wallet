import { TrendingUp, TrendingDown, Wallet, Calendar, PiggyBank, DollarSign } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency, filterExpensesByPeriod, calculateTotal, getPreviousMonthSpending, calculateChangePercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { parseISO, isThisMonth } from 'date-fns';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'warning' | 'success';
  className?: string;
}) => {
  const variantStyles = {
    default: 'stat-card',
    primary: 'stat-card-primary',
    warning: 'stat-card border-warning/30 bg-gradient-to-br from-warning/15 to-warning/5',
    success: 'stat-card border-success/30 bg-gradient-to-br from-success/15 to-success/5',
  };

  const iconStyles = {
    default: 'bg-muted/80 text-muted-foreground',
    primary: 'bg-primary/20 text-primary',
    warning: 'bg-warning/20 text-warning',
    success: 'bg-success/20 text-success',
  };

  return (
    <div className={cn(variantStyles[variant], 'opacity-0 animate-slide-up', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl backdrop-blur-sm', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && trendValue && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm',
              trend === 'up' && 'bg-destructive/15 text-destructive',
              trend === 'down' && 'bg-success/15 text-success',
              trend === 'neutral' && 'bg-muted/80 text-muted-foreground'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold font-display tracking-tight">{value}</p>
    </div>
  );
};

export const DashboardStats = () => {
  const { expenses, income, budget, currency } = useExpenses();

  const monthExpenses = filterExpensesByPeriod(expenses, 'month');
  const todayExpenses = filterExpensesByPeriod(expenses, 'today');
  
  const totalThisMonth = calculateTotal(monthExpenses);
  const todaySpending = calculateTotal(todayExpenses);
  const previousMonthTotal = getPreviousMonthSpending(expenses);
  
  const changePercentage = calculateChangePercentage(totalThisMonth, previousMonthTotal);
  const trend = changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'neutral';

  // Calculate monthly income
  const monthIncome = income.filter((i) => {
    try {
      return isThisMonth(parseISO(i.date));
    } catch {
      return false;
    }
  });
  const totalIncomeThisMonth = monthIncome.reduce((sum, i) => sum + i.amount, 0);
  const netBalance = totalIncomeThisMonth - totalThisMonth;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="This Month"
        value={formatCurrency(totalThisMonth, currency)}
        icon={Wallet}
        trend={trend}
        trendValue={`${Math.abs(changePercentage).toFixed(0)}%`}
        variant="primary"
        className="stagger-1"
      />
      <StatCard
        title="Today"
        value={formatCurrency(todaySpending, currency)}
        icon={Calendar}
        variant="default"
        className="stagger-2"
      />
      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncomeThisMonth, currency)}
        icon={DollarSign}
        variant="success"
        className="stagger-3"
      />
      <StatCard
        title="Net Balance"
        value={formatCurrency(Math.abs(netBalance), currency)}
        icon={PiggyBank}
        trend={netBalance >= 0 ? 'down' : 'up'}
        trendValue={netBalance >= 0 ? 'Saving' : 'Over'}
        variant={netBalance >= 0 ? 'success' : 'warning'}
        className="stagger-4"
      />
    </div>
  );
};
