import { useExpenses } from '@/context/ExpenseContext';
import { CURRENCIES, CurrencyCode } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ProfileSettings } from './ProfileSettings';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export const SettingsView = () => {
  const { currency, setCurrency, budget, setBudget, expenses } = useExpenses();
  const { theme, setTheme } = useTheme();
  const [localBudget, setLocalBudget] = useState(budget?.amount?.toString() || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Amount', 'Category', 'Payment Method', 'Note'];
    const rows = expenses.map((e) => [
      e.date,
      e.name,
      e.amount.toString(),
      e.category,
      e.paymentMethod || '',
      e.note || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div>
        <h2 className="text-2xl font-bold font-display mb-1">Settings</h2>
        <p className="text-muted-foreground">Customize your expense tracker</p>
      </div>

      {/* Profile Settings */}
      <ProfileSettings />

      {/* Appearance */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold font-display mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light' as const, label: 'Light', icon: Sun },
            { id: 'dark' as const, label: 'Dark', icon: Moon },
            { id: 'system' as const, label: 'System', icon: Monitor },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2',
                theme === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-muted hover:border-border'
              )}
            >
              <option.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold font-display mb-4">Currency</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CURRENCIES.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all',
                currency === curr.code
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-muted hover:border-border'
              )}
            >
              <span className="text-2xl font-bold">{curr.symbol}</span>
              <p className="text-sm text-muted-foreground mt-1">{curr.code}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Settings */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold font-display mb-4">Monthly Budget</h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="0"
            step="100"
            placeholder="Enter budget amount"
            defaultValue={budget?.amount || ''}
            onChange={(e) => setLocalBudget(e.target.value)}
            className="input-field flex-1"
          />
          <span className="text-muted-foreground font-medium hidden sm:inline">/ month</span>
          <button
            onClick={() => {
              const value = parseFloat(localBudget);
              if (!isNaN(value) && value >= 0) {
                setBudget(value);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
              }
            }}
            className={cn(
              "btn-primary transition-all",
              saveSuccess && "bg-green-500 hover:bg-green-600 text-white border-green-500"
            )}
            disabled={localBudget === '' && !budget}
          >
            {saveSuccess ? 'Saved!' : 'Save Budget'}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Set a budget to track your spending and get alerts when you're close to the limit.
        </p>
      </div>

      {/* Export Data */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold font-display mb-4">Export Data</h3>
        <p className="text-muted-foreground mb-4">
          Download all your expenses as a CSV file for backup or analysis.
        </p>
        <button onClick={handleExportCSV} className="btn-secondary">
          📥 Export to CSV
        </button>
      </div>

      {/* About */}
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold font-display mb-4">About SpendWise</h3>
        <p className="text-muted-foreground">
          SpendWise is a simple, beautiful expense tracker designed to help you understand
          where your money goes and build better financial habits.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Your data is securely stored in the cloud and synced across all your devices.
        </p>
      </div>
    </div>
  );
};
