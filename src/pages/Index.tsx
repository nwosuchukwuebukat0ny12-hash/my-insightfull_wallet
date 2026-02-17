import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { Layout } from '@/components/layout/Layout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { SpendingTrend } from '@/components/dashboard/SpendingTrend';
import { WeeklySpendingCard } from '@/components/dashboard/WeeklySpendingCard';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { SettingsView } from '@/components/settings/SettingsView';
import { Expense } from '@/lib/types';
import { format } from 'date-fns';

type ViewType = 'dashboard' | 'expenses' | 'settings';

const DashboardView = ({ onAddExpense }: { onAddExpense: () => void }) => {
  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold font-display mb-1">Dashboard</h2>
          <p className="text-muted-foreground">{currentMonth}</p>
        </div>
        <button onClick={onAddExpense} className="btn-primary hidden sm:flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
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
    </div>
  );
};

const ExpensesView = ({ 
  onAddExpense, 
  onEditExpense 
}: { 
  onAddExpense: () => void; 
  onEditExpense: (expense: Expense) => void;
}) => {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display mb-1">Expenses</h2>
          <p className="text-muted-foreground">Manage your spending</p>
        </div>
        <button onClick={onAddExpense} className="btn-primary hidden sm:flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <ExpenseList onEditExpense={onEditExpense} />
    </div>
  );
};

const AppContent = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showForm, setShowForm] = useState(false);
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
      {currentView === 'dashboard' && <DashboardView onAddExpense={handleAddExpense} />}
      {currentView === 'expenses' && (
        <ExpensesView onAddExpense={handleAddExpense} onEditExpense={handleEditExpense} />
      )}
      {currentView === 'settings' && <SettingsView />}

      {/* Floating Action Button - Mobile */}
      {currentView !== 'settings' && (
        <button onClick={handleAddExpense} className="fab-button lg:hidden">
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm 
          expense={editingExpense} 
          onClose={handleCloseForm}
          onNavigateToSettings={handleNavigateToSettings}
        />
      )}
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
