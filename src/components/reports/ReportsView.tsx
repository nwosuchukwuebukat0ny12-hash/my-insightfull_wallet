import { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency, cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, PiggyBank, Calendar, 
  ChevronDown, Filter, Download
} from 'lucide-react';
import { 
  format, subMonths, startOfMonth, endOfMonth, 
  isWithinInterval, parseISO, eachMonthOfInterval 
} from 'date-fns';

type PeriodType = '3months' | '6months' | 'year' | 'all';

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

export const ReportsView = () => {
  const { expenses, income, currency } = useExpenses();
  const [period, setPeriod] = useState<PeriodType>('6months');

  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case '3months': start = startOfMonth(subMonths(now, 2)); break;
      case '6months': start = startOfMonth(subMonths(now, 5)); break;
      case 'year': start = startOfMonth(subMonths(now, 11)); break;
      case 'all': {
        if (expenses.length === 0 && income.length === 0) return { start: startOfMonth(now), end: endOfMonth(now) };
        const allDates = [...expenses.map(e => parseISO(e.date)), ...income.map(i => parseISO(i.date))];
        start = new Date(Math.min(...allDates.map(d => d.getTime())));
        break;
      }
    }
    
    return { start, end: endOfMonth(now) };
  }, [period, expenses, income]);

  const filteredData = useMemo(() => {
    const filterFn = (item: { date: string }) => isWithinInterval(parseISO(item.date), dateRange);
    return {
      expenses: expenses.filter(filterFn),
      income: income.filter(filterFn)
    };
  }, [expenses, income, dateRange]);

  const monthlyTrendData = useMemo(() => {
    const months = eachMonthOfInterval(dateRange);
    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthIncome = filteredData.income
        .filter(i => i.date.startsWith(monthStr))
        .reduce((sum, i) => sum + i.amount, 0);
      const monthExpenses = filteredData.expenses
        .filter(e => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + e.amount, 0);
      
      return {
        name: format(month, 'MMM yy'),
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthIncome - monthExpenses
      };
    });
  }, [filteredData, dateRange]);

  const categoryDistribution = useMemo(() => {
    const totals = {} as Record<string, number>;
    filteredData.expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    return Object.entries(totals)
      .map(([catId, amount]) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return {
          name: cat?.name || catId,
          value: amount,
          color: CATEGORY_COLORS[catId] || '#6b7280',
          icon: cat?.icon || '📦'
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredData.expenses]);

  const totals = useMemo(() => {
    const totalIncome = filteredData.income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return { totalIncome, totalExpenses, netSavings, savingsRate };
  }, [filteredData]);

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display mb-1">Financial Reports</h2>
          <p className="text-muted-foreground text-sm">Analyze your spending habits and trends</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative inline-block text-left">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodType)}
              className="appearance-none bg-card border border-border px-4 py-2 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          
          <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Total Income</span>
          </div>
          <p className="text-xl font-bold font-display">{formatCurrency(totals.totalIncome, currency)}</p>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Total Expenses</span>
          </div>
          <p className="text-xl font-bold font-display">{formatCurrency(totals.totalExpenses, currency)}</p>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Net Savings</span>
          </div>
          <p className="text-xl font-bold font-display">{formatCurrency(totals.netSavings, currency)}</p>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-info/10 text-info">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Savings Rate</span>
          </div>
          <p className="text-xl font-bold font-display">{totals.savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Trend */}
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold font-display mb-6">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold font-display mb-6">Spending Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {categoryDistribution.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.value, currency)}</span>
                </div>
              ))}
              {categoryDistribution.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {categoryDistribution.length - 5} more categories
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Category List */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold font-display">Spending Breakdown</h3>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Filter className="w-3 h-3" />
            Sorted by highest spending
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">% of Total</th>
                <th className="px-6 py-4">Monthly Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {categoryDistribution.map((item, index) => {
                const totalExpenses = totals.totalExpenses;
                const percent = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                const monthsCount = monthlyTrendData.length || 1;
                
                return (
                  <tr key={index} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-card border border-border">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(item.value, currency)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{percent.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatCurrency(item.value / monthsCount, currency)}/mo
                    </td>
                  </tr>
                );
              })}
              {categoryDistribution.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No data available for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
