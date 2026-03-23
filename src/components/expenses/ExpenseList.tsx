import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Search, Filter, ChevronDown, Trash2 } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { ExpenseItem } from './ExpenseItem';
import { Expense, CategoryType, Income } from '@/lib/types';
import { CATEGORIES, INCOME_SOURCES } from '@/lib/constants';
import { filterExpensesByPeriod, formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
  onEditExpense: (expense: Expense) => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';
type ListType = 'all' | 'expenses' | 'income';

export const ExpenseList = ({ onEditExpense }: ExpenseListProps) => {
  const { expenses, income, currency, deleteIncome } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [listType, setListType] = useState<ListType>('all');

  const filteredExpenses = useMemo(() => {
    let result = filterExpensesByPeriod(expenses, timeFilter);

    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.note?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [expenses, timeFilter, categoryFilter, debouncedSearchQuery]);

  // Filter income
  const filteredIncome = useMemo(() => {
    let result = filterExpensesByPeriod(income, timeFilter);

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.note?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [income, timeFilter, debouncedSearchQuery]);

  // Combine for "all" view
  type ListItem = { type: 'expense'; data: Expense } | { type: 'income'; data: Income };
  const combinedList = useMemo(() => {
    const items: ListItem[] = [];
    if (listType === 'all' || listType === 'expenses') {
      filteredExpenses.forEach((e) => items.push({ type: 'expense', data: e }));
    }
    if (listType === 'all' || listType === 'income') {
      filteredIncome.forEach((i) => items.push({ type: 'income', data: i }));
    }
    // Sort combined by date descending
    items.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
    return items;
  }, [filteredExpenses, filteredIncome, listType]);

  return (
    <div className="glass-card animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold font-display">Recent Transactions</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-ghost flex items-center gap-1.5',
              showFilters && 'bg-muted/80'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-3">
          {(['all', 'expenses', 'income'] as ListType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setListType(tab)}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                listType === tab
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border/30 space-y-3 animate-fade-in">
            {/* Time Filter */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Time Period</p>
              <div className="flex flex-wrap gap-2">
                {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                      timeFilter === filter
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                    categoryFilter === 'all'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                      categoryFilter === cat.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-border/20">
        {combinedList.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 animate-float">
              <span className="text-2xl">💸</span>
            </div>
            <p className="text-muted-foreground">
              {expenses.length === 0 && income.length === 0
                ? 'No transactions yet. Add your first expense or income!'
                : 'No transactions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {combinedList.map((item, index) => (
              <div
                key={item.data.id}
                className="opacity-0 animate-slide-up"
                style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
              >
                {item.type === 'expense' ? (
                  <ExpenseItem expense={item.data as Expense} onEdit={onEditExpense} />
                ) : (
                  <div className="expense-row group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="category-badge border backdrop-blur-sm bg-emerald-500/15 text-emerald-600 border-emerald-500/20">
                        <span>{INCOME_SOURCES.find(s => s.id === (item.data as Income).source)?.icon || '💵'}</span>
                        <span className="hidden sm:inline">{INCOME_SOURCES.find(s => s.id === (item.data as Income).source)?.name || 'Income'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item.data.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(item.data.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-lg tabular-nums text-emerald-500">
                        +{formatCurrency(item.data.amount, currency)}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => {
                            if (confirm('Delete this income entry?')) {
                              deleteIncome(item.data.id);
                            }
                          }}
                          className="p-2 rounded-xl hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
