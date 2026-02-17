import { 
  Wallet, 
  PieChart, 
  TrendingUp, 
  Target, 
  Smartphone, 
  Shield 
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Easy Expense Tracking',
    description: 'Add expenses in just a few taps. Quick, simple, and satisfying.',
  },
  {
    icon: PieChart,
    title: 'Smart Categories',
    description: 'Organize spending with intuitive categories that make sense.',
  },
  {
    icon: TrendingUp,
    title: 'Visual Insights',
    description: 'Beautiful charts show where your money goes at a glance.',
  },
  {
    icon: Target,
    title: 'Budget Awareness',
    description: 'Set spending limits and track your progress in real-time.',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description: 'Perfect on desktop and mobile — track expenses anywhere.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your financial data stays safe and completely private.',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to master your money
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features wrapped in a simple interface. No finance degree required.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
