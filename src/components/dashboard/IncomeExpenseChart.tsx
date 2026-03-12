import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency, filterExpensesByPeriod } from '@/lib/utils';
import { CURRENCIES } from '@/lib/constants';
import { startOfMonth, endOfMonth, startOfWeek, addWeeks, format, isWithinInterval, parseISO } from 'date-fns';

export const IncomeExpenseChart = () => {
  const { expenses, income, currency } = useExpenses();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Group data by week of the current month
  const chartData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = addWeeks(monthStart, i);
    const weekEnd = i < 3 ? addWeeks(monthStart, i + 1) : monthEnd;

    const weekExpenses = expenses.filter((e) => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });

    const weekIncome = income.filter((inc) => {
      const d = parseISO(inc.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });

    const totalExpenses = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = weekIncome.reduce((sum, inc) => sum + inc.amount, 0);

    return {
      week: `Week ${i + 1}`,
      income: totalIncome,
      expenses: totalExpenses,
    };
  });

  const hasData = chartData.some((d) => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <div className="chart-container h-full animate-slide-up stagger-3">
        <h3 className="text-lg font-semibold font-display mb-4">Income vs Expenses</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-float">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-muted-foreground text-center">
            Add income and expenses<br />
            to compare your cash flow.
          </p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="font-bold" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container h-full animate-slide-up stagger-3">
      <h3 className="text-lg font-semibold font-display mb-4">Income vs Expenses</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={50}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const currencyInfo = CURRENCIES.find(c => c.code === currency);
                const symbol = currencyInfo?.symbol || '$';
                return `${symbol}${value}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground capitalize">{value}</span>
              )}
            />
            <Bar
              dataKey="income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />
            <Bar
              dataKey="expenses"
              fill="#f97316"
              radius={[6, 6, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
