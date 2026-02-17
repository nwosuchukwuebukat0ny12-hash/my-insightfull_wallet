import { Link } from 'react-router-dom';
import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const LandingNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">SpendWise</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </button>
            <Link 
              to="/auth" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Login
            </Link>
            <Button asChild className="rounded-xl">
              <Link to="/auth?mode=signup">Get Started Free</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-left px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
            >
              How It Works
            </button>
            <Link 
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
            >
              Login
            </Link>
            <Button asChild className="rounded-xl mx-4">
              <Link to="/auth?mode=signup">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
