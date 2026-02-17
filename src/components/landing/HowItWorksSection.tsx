import { Plus, BarChart3, Smile } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Plus,
    title: 'Add your expenses',
    description: 'Log what you spend in seconds. Just enter the amount, pick a category, and you\'re done.',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'See instant insights',
    description: 'Watch your spending patterns come to life with beautiful charts and smart summaries.',
  },
  {
    number: '03',
    icon: Smile,
    title: 'Stay in control',
    description: 'Make smarter decisions about your money. No stress, no spreadsheets, just clarity.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Getting started is easy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to financial clarity. No complicated setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line (hidden on mobile and after last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              {/* Step number badge */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border shadow-lg mb-6">
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.number}
                </div>
                <step.icon className="w-10 h-10 text-primary" />
              </div>

              <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
