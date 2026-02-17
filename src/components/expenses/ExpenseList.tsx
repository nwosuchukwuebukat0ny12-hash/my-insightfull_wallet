import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { ExpenseItem } from './ExpenseItem';
import { Expense, CategoryType } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { filterExpensesByPeriod } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
  onEditExpense: (expense: Expense) => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

export const ExpenseList = ({ onEditExpense }: ExpenseListProps) => {
  const { expenses } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredExpenses = useMemo(() => {
    let result = filterExpensesByPeriod(expenses, timeFilter);

    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.note?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [expenses, timeFilter, categoryFilter, searchQuery]);

  return (
    <div className="glass-card animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold font-display">Recent Expenses</h3>
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

      {/* Expense List */}
      <div className="divide-y divide-border/20">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 animate-float">
              <span className="text-2xl">💸</span>
            </div>
            <p className="text-muted-foreground">
              {expenses.length === 0
                ? 'No expenses yet. Add your first expense!'
                : 'No expenses match your filters.'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredExpenses.map((expense, index) => (
              <div 
                key={expense.id} 
                className="opacity-0 animate-slide-up"
                style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
              >
                <ExpenseItem expense={expense} onEdit={onEditExpense} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
