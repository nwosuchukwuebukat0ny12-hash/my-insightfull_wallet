import { useState, useEffect } from 'react';
import { X, Settings, AlertCircle } from 'lucide-react';
import { Expense, CategoryType, PaymentMethod } from '@/lib/types';
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';
import { useExpenses } from '@/context/ExpenseContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { expenseSchema } from '@/lib/validations';

interface ExpenseFormProps {
  expense?: Expense | null;
  onClose: () => void;
  onNavigateToSettings?: () => void;
}

export const ExpenseForm = ({ expense, onClose, onNavigateToSettings }: ExpenseFormProps) => {
  const { addExpense, updateExpense, budget } = useExpenses();
  const isEditing = !!expense;
  const hasBudget = budget && budget.amount > 0;

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'food' as CategoryType,
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
    paymentMethod: 'card' as PaymentMethod,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name,
        amount: String(expense.amount),
        category: expense.category,
        date: expense.date.split('T')[0],
        note: expense.note || '',
        paymentMethod: expense.paymentMethod || 'card',
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = expenseSchema.safeParse({
      ...formData,
      name: formData.name.trim(),
      note: formData.note.trim() || undefined,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0].message;
      toast.error(firstError);
      return;
    }

    const expenseData = validation.data;

    if (isEditing && expense) {
      await updateExpense(expense.id, expenseData);
    } else {
      await addExpense(expenseData);
    }

    onClose();
  };

  const handleGoToSettings = () => {
    onClose();
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  // Show friendly message if no budget is set (only for new expenses, not editing)
  if (!hasBudget && !isEditing) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Budget Not Set Yet! 🎯</DialogTitle>
            <DialogDescription>
              Before you start tracking expenses, let's set up your monthly budget.
              This helps you stay on top of your spending and reach your financial goals.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button onClick={handleGoToSettings} className="w-full gap-2">
              <Settings className="w-4 h-4" />
              Go to Settings
            </Button>
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              I'll do it later
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <div className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold font-display">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 pb-8 sm:pb-4 space-y-4">
          {/* Amount */}
          <div>
            <label htmlFor="expense-amount" className="block text-sm font-medium text-muted-foreground mb-1.5">
              Amount *
            </label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field text-2xl font-bold"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="expense-desc" className="block text-sm font-medium text-muted-foreground mb-1.5">
              Description *
            </label>
            <input
              id="expense-desc"
              type="text"
              placeholder="What did you spend on?"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {/* Category */}
          <fieldset>
            <legend className="block text-sm font-medium text-muted-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent">
              Category
            </legend>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all',
                    formData.category === cat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted hover:border-border'
                  )}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {cat.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Date */}
          <div>
            <label htmlFor="expense-date" className="block text-sm font-medium text-muted-foreground mb-1.5">
              Date
            </label>
            <input
              id="expense-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Payment Method */}
          <fieldset>
            <legend className="block text-sm font-medium text-muted-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent">
              Payment Method
            </legend>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                  className={cn(
                    'px-3 py-2 rounded-lg border-2 flex items-center gap-2 transition-all',
                    formData.paymentMethod === method.id
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted hover:border-border'
                  )}
                >
                  <span>{method.icon}</span>
                  <span className="text-sm font-medium">{method.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Note */}
          <div>
            <label htmlFor="expense-note" className="block text-sm font-medium text-muted-foreground mb-1.5">
              Note (optional)
            </label>
            <textarea
              id="expense-note"
              placeholder="Add a note..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="input-field resize-none"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full">
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};