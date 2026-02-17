import { Link } from 'react-router-dom';
import { ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection = () => {
  return (
    <section className="py-20 lg:py-28 bg-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/25">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>

        {/* Heading */}
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Ready to take control of your finances?
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of people who've already simplified their expense tracking. Start your journey to financial clarity today — it's completely free.
        </p>

        {/* CTA Button */}
        <Button 
          asChild 
          size="lg" 
          className="rounded-xl px-10 h-16 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          <Link to="/auth?mode=signup">
            Create Your Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>

        {/* Reassurance */}
        <p className="mt-6 text-sm text-muted-foreground">
          Free forever • No credit card needed • Takes 30 seconds
        </p>
      </div>
    </section>
  );
};
