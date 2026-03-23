import { useState } from 'react';
import { X } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { INCOME_SOURCES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { incomeSchema } from '@/lib/validations';
import { toast } from 'sonner';

interface IncomeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncomeForm = ({ isOpen, onClose }: IncomeFormProps) => {
  const { addIncome } = useExpenses();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('salary');
  const [customSource, setCustomSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setAmount('');
    setSource('salary');
    setCustomSource('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSource = source === 'other' && customSource.trim() ? customSource.trim() : source;

    const validation = incomeSchema.safeParse({
      name: name.trim(),
      amount,
      source: finalSource,
      date,
      note: note.trim() || undefined,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0].message;
      toast.error(firstError);
      return;
    }

    const incomeData = validation.data;

    setIsSubmitting(true);
    try {
      await addIncome(incomeData);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Add Income"
    >
      <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border/50 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/30">
          <h2 className="text-xl font-bold font-display">Add Income</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 pb-8 sm:pb-4">
          {/* Description */}
          <div>
            <label htmlFor="income-name" className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <input
              id="income-name"
              type="text"
              placeholder="e.g. March Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
              autoFocus
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="income-amount" className="block text-sm font-medium mb-1.5">
              Amount
            </label>
            <input
              id="income-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field text-lg font-semibold"
              required
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Source</label>
            <div className="grid grid-cols-3 gap-2">
              {INCOME_SOURCES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center transition-all text-sm',
                    source === s.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-transparent bg-muted hover:border-border'
                  )}
                >
                  <span className="text-lg">{s.icon}</span>
                  <p className="mt-1 font-medium">{s.name}</p>
                </button>
              ))}
            </div>
            {source === 'other' && (
              <input
                type="text"
                placeholder="e.g. Rental Income, Bonus, Refund..."
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="input-field mt-2"
                autoFocus
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="income-date" className="block text-sm font-medium mb-1.5">
              Date
            </label>
            <input
              id="income-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="income-note" className="block text-sm font-medium mb-1.5">
              Note (optional)
            </label>
            <textarea
              id="income-note"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none"
              rows={2}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !amount}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? 'Adding...' : '💰 Add Income'}
          </button>
        </form>
      </div>
    </div>
  );
};
