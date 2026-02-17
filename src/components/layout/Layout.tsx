import { useState } from 'react';
import { Wallet, LayoutDashboard, List, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'expenses' | 'settings';
  onViewChange: (view: 'dashboard' | 'expenses' | 'settings') => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: List },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export const Layout = ({ children, currentView, onViewChange }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-border bg-card p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">SpendWise</h1>
            <p className="text-xs text-muted-foreground">Track your money</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                currentView === item.id ? 'nav-item-active' : 'nav-item',
                'w-full'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Menu & Footer */}
        <div className="pt-4 border-t border-border space-y-4">
          <UserMenu />
          <p className="text-xs text-muted-foreground text-center">
            Made with 💚 for your finances
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold">SpendWise</h1>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-background z-30 pt-16 animate-fade-in">
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  currentView === item.id ? 'nav-item-active' : 'nav-item',
                  'w-full text-lg'
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="container max-w-5xl py-6 px-4 lg:py-8">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-t border-border flex items-center justify-around z-40">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
              currentView === item.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
