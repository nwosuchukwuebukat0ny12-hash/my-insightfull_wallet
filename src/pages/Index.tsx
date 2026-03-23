import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { Layout } from '@/components/layout/Layout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { SpendingTrend } from '@/components/dashboard/SpendingTrend';
import { WeeklySpendingCard } from '@/components/dashboard/WeeklySpendingCard';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { IncomeForm } from '@/components/income/IncomeForm';
import { SettingsView } from '@/components/settings/SettingsView';
import { ReportsView } from '@/components/reports/ReportsView';
import { Expense } from '@/lib/types';
import { format } from 'date-fns';

type ViewType = 'dashboard' | 'expenses' | 'settings' | 'reports';

const DashboardView = ({ onAddExpense, onAddIncome }: { onAddExpense: () => void; onAddIncome: () => void }) => {
  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold font-display mb-1">Dashboard</h2>
          <p className="text-muted-foreground">{currentMonth}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAddIncome} className="btn-secondary flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <span className="hidden sm:inline">Add Income</span>
          </button>
          <button onClick={onAddExpense} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>
      </div>

      <DashboardStats />

      {/* Weekly spending card inline with budget */}
      <div className="grid md:grid-cols-3 gap-6">
        <BudgetProgress />
        <SpendingChart />
        <WeeklySpendingCard />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        <SpendingTrend />
        <WeeklyTrendChart />
      </div>

      {/* Income vs Expenses */}
      <div className="grid md:grid-cols-1 gap-6">
        <IncomeExpenseChart />
      </div>
    </div>
  );
};

const ExpensesView = ({
  onAddExpense,
  onAddIncome,
  onEditExpense
}: {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onEditExpense: (expense: Expense) => void;
}) => {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display mb-1">Expenses</h2>
          <p className="text-muted-foreground">Manage your spending</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAddIncome} className="btn-secondary flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <span className="hidden sm:inline">Add Income</span>
          </button>
          <button onClick={onAddExpense} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>
      </div>

      <ExpenseList onEditExpense={onEditExpense} />
    </div>
  );
};

const AppContent = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleNavigateToSettings = () => {
    setCurrentView('settings');
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <DashboardView onAddExpense={handleAddExpense} onAddIncome={() => setShowIncomeForm(true)} />}
      {currentView === 'reports' && <ReportsView />}
      {currentView === 'expenses' && (
        <ExpensesView onAddExpense={handleAddExpense} onAddIncome={() => setShowIncomeForm(true)} onEditExpense={handleEditExpense} />
      )}
      {currentView === 'settings' && <SettingsView />}

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleCloseForm}
          onNavigateToSettings={handleNavigateToSettings}
        />
      )}

      {/* Income Form Modal */}
      <IncomeForm isOpen={showIncomeForm} onClose={() => setShowIncomeForm(false)} />
    </Layout>
  );
};

const Index = () => {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
};

export default Index;
