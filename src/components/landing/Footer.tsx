import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">SpendWise</span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link 
              to="/auth" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/auth?mode=signup" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Up
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} SpendWise. Made with 💚 for your finances.
          </p>
        </div>
      </div>
    </footer>
  );
};
