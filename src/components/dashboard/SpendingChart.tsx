import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useExpenses } from '@/context/ExpenseContext';
import { filterExpensesByPeriod, getSpendingByCategory, formatCurrency } from '@/lib/utils';
import { getCategoryById } from '@/lib/constants';

const CATEGORY_COLORS: Record<string, string> = {
  food: '#f97316',
  transport: '#3b82f6',
  rent: '#a855f7',
  utilities: '#eab308',
  entertainment: '#ec4899',
  shopping: '#f43f5e',
  health: '#22c55e',
  education: '#0ea5e9',
  savings: '#10b981',
  other: '#6b7280',
};

export const SpendingChart = () => {
  const { expenses, currency } = useExpenses();
  
  const monthExpenses = filterExpensesByPeriod(expenses, 'month');
  const categorySpending = getSpendingByCategory(monthExpenses);

  if (categorySpending.length === 0) {
    return (
      <div className="glass-card p-6 h-full animate-slide-up stagger-2">
        <h3 className="text-lg font-semibold font-display mb-4">Spending by Category</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-float">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-muted-foreground text-center">
            No expenses this month yet.<br />
            Add some to see your spending breakdown.
          </p>
        </div>
      </div>
    );
  }

  const chartData = categorySpending.map((item) => {
    const category = getCategoryById(item.category);
    return {
      name: category.name,
      value: item.amount,
      icon: category.icon,
      color: CATEGORY_COLORS[item.category],
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="font-medium">
            {data.icon} {data.name}
          </p>
          <p className="text-primary font-bold text-lg">{formatCurrency(data.value, currency)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <div
          key={index}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-muted/50 backdrop-blur-sm border border-border/30"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="glass-card p-6 h-full animate-slide-up stagger-2">
      <h3 className="text-lg font-semibold font-display mb-4">Spending by Category</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
                  strokeWidth={0}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
