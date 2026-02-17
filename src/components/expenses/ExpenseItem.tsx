import { Trash2, Edit2 } from 'lucide-react';
import { Expense } from '@/lib/types';
import { getCategoryById } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useExpenses } from '@/context/ExpenseContext';
import { cn } from '@/lib/utils';

const CATEGORY_BG: Record<string, string> = {
  food: 'bg-orange-500/15 text-orange-600 border-orange-500/20',
  transport: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  rent: 'bg-purple-500/15 text-purple-600 border-purple-500/20',
  utilities: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/20',
  entertainment: 'bg-pink-500/15 text-pink-600 border-pink-500/20',
  shopping: 'bg-rose-500/15 text-rose-600 border-rose-500/20',
  health: 'bg-green-500/15 text-green-600 border-green-500/20',
  education: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/20',
  savings: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  other: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
};

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
}

export const ExpenseItem = ({ expense, onEdit }: ExpenseItemProps) => {
  const { deleteExpense, currency } = useExpenses();
  const category = getCategoryById(expense.category);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(expense.id);
    }
  };

  return (
    <div className="expense-row group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn(
          'category-badge border backdrop-blur-sm',
          CATEGORY_BG[expense.category]
        )}>
          <span>{category.icon}</span>
          <span className="hidden sm:inline">{category.name}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{expense.name}</p>
          <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="font-semibold text-lg tabular-nums">{formatCurrency(expense.amount, currency)}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => onEdit(expense)}
            className="p-2 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
