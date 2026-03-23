import { useExpenses } from '@/context/ExpenseContext';
import { filterExpensesByPeriod, formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Target, AlertCircle } from 'lucide-react';

export const SpendingChart = () => {
  const { expenses, budget, currency } = useExpenses();
  
  const monthExpenses = filterExpensesByPeriod(expenses, 'month');
  
  // Get categories that have a budget set
  const budgetedCategories = CATEGORIES.filter(cat => budget?.categoryBudgets?.[cat.id]);

  if (budgetedCategories.length === 0) {
    return (
      <div className="glass-card p-6 h-full animate-slide-up stagger-2">
        <h3 className="text-lg font-semibold font-display mb-4">Category Budgets</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 animate-float">
            <Target className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <p className="text-muted-foreground text-center text-sm px-6">
            No category budgets set.<br />
            Edit your budget to track specific categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full animate-slide-up stagger-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display">Category Budgets</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <Target className="w-3 h-3" />
          Monthly Goals
        </div>
      </div>

      <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {budgetedCategories.map((cat) => {
          const catBudget = budget?.categoryBudgets?.[cat.id] || 0;
          const catSpent = monthExpenses
            .filter(e => e.category === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);
          
          const percentage = Math.min(100, (catSpent / catBudget) * 100);
          const isOver = catSpent > catBudget;
          const isNear = percentage >= 80 && !isOver;

          return (
            <div key={cat.id} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors",
                    isOver ? "bg-destructive/10" : isNear ? "bg-warning/10" : "bg-primary/10"
                  )}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{cat.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {isOver ? (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {formatCurrency(catSpent - catBudget, currency)} over
                        </span>
                      ) : (
                        <span>{formatCurrency(catBudget - catSpent, currency)} remaining</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{Math.round(percentage)}%</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatCurrency(catSpent, currency)}
                  </p>
                </div>
              </div>

              <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5">
                <div 
                  className={cn(
                    "h-full transition-all duration-700 ease-out rounded-full",
                    isOver ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" : 
                    isNear ? "bg-warning shadow-[0_0_8px_rgba(234,179,8,0.4)]" : 
                    "bg-primary/70 shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
