import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const ProblemSolutionSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Problem */}
          <div className="card-elevated p-8 border-destructive/20">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-display text-xl font-bold mb-4 text-foreground">
              Sound familiar?
            </h3>
            <ul className="space-y-4">
              {[
                "You check your account and wonder where your money went",
                "Tracking expenses feels like a chore you keep avoiding",
                "Spreadsheets are confusing and apps are too complicated",
                "You want to save more but don't know where to start",
              ].map((problem, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="card-elevated p-8 border-primary/20">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold mb-4 text-foreground">
              There's a better way
            </h3>
            <ul className="space-y-4">
              {[
                "See exactly where every dollar goes with clear categories",
                "Add expenses in seconds — no complicated setup",
                "Beautiful charts that make your spending crystal clear",
                "Set budgets and stay on track without stress",
              ].map((solution, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
