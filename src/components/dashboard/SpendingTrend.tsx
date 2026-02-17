import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useExpenses } from '@/context/ExpenseContext';
import { getDailySpending, formatCurrency, formatDateShort } from '@/lib/utils';
import { CURRENCIES } from '@/lib/constants';

export const SpendingTrend = () => {
  const { expenses, currency } = useExpenses();
  const dailySpending = getDailySpending(expenses);

  if (dailySpending.length === 0) {
    return (
      <div className="chart-container h-full animate-slide-up stagger-3">
        <h3 className="text-lg font-semibold font-display mb-4">Daily Spending Trend</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-float">
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-muted-foreground text-center">
            Start tracking expenses<br />
            to see your spending trend.
          </p>
        </div>
      </div>
    );
  }

  const chartData = dailySpending.map((item) => ({
    date: formatDateShort(item.date),
    amount: item.amount,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-primary font-bold text-lg">{formatCurrency(payload[0].value, currency)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container h-full animate-slide-up stagger-3">
      <h3 className="text-lg font-semibold font-display mb-4">Daily Spending Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(160 90% 35%)" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const currencyInfo = CURRENCIES.find(c => c.code === currency);
                const symbol = currencyInfo?.symbol || '$';
                return `${symbol}${value}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)', radius: 8 }} />
            <Bar
              dataKey="amount"
              fill="url(#barGradient)"
              radius={[8, 8, 4, 4]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
