import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency } from '@/lib/utils';
import { CURRENCIES } from '@/lib/constants';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

export const WeeklyTrendChart = () => {
  const { expenses, currency } = useExpenses();

  // Get current week's days
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayLabel: format(date, 'EEE'),
      dayShort: format(date, 'E'),
    };
  });

  // Calculate daily spending for the week
  const chartData = weekDays.map((day) => {
    const dayExpenses = expenses.filter((expense) => {
      const expenseDate = format(parseISO(expense.date), 'yyyy-MM-dd');
      return expenseDate === day.date;
    });
    
    const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      day: day.dayShort,
      amount: total,
      fullDay: day.dayLabel,
    };
  });

  const hasData = chartData.some((d) => d.amount > 0);

  if (!hasData) {
    return (
      <div className="chart-container h-full animate-slide-up stagger-4">
        <h3 className="text-lg font-semibold font-display mb-4">Weekly Trend</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-float">
            <span className="text-2xl">📉</span>
          </div>
          <p className="text-muted-foreground text-center">
            Start tracking expenses<br />
            to see your weekly trend.
          </p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm text-muted-foreground">{payload[0]?.payload?.fullDay}</p>
          <p className="text-primary font-bold text-lg">{formatCurrency(payload[0].value, currency)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container h-full animate-slide-up stagger-4">
      <h3 className="text-lg font-semibold font-display mb-4">Weekly Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#colorAmount)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4, stroke: 'hsl(var(--card))' }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--card))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
