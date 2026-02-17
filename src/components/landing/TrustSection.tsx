import { Lock, CreditCard, Heart, Zap } from 'lucide-react';

const trustPoints = [
  {
    icon: Lock,
    title: 'Your data stays private',
    description: 'We never share or sell your financial information. Your data belongs to you.',
  },
  {
    icon: CreditCard,
    title: 'No hidden charges',
    description: 'Free means free. No surprise fees, no premium traps, no credit card required.',
  },
  {
    icon: Heart,
    title: 'Built for real life',
    description: 'Designed for how you actually spend, not how finance textbooks say you should.',
  },
  {
    icon: Zap,
    title: 'Always improving',
    description: 'We listen to our users and continuously make SpendWise better for you.',
  },
];

export const TrustSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why you can trust SpendWise
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe managing money should be simple, safe, and stress-free.
          </p>
        </div>

        {/* Trust Points */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {trustPoints.map((point, index) => (
            <div 
              key={index}
              className="flex gap-4 p-6 rounded-2xl bg-card border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <point.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {point.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
