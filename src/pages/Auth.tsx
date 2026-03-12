import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Info } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  // Handle recovery session from email link - check URL hash for recovery tokens
  useEffect(() => {
    const handleRecoveryFromUrl = async () => {
      // Check if URL contains recovery tokens in the hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'recovery') {
        setMode('reset');
        setIsRecoverySession(true);

        // Set the session from the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });

        if (error) {
          toast({
            title: 'Recovery link expired',
            description: 'Please request a new password reset link.',
            variant: 'destructive',
          });
          setMode('forgot');
        }

        // Clean up the URL hash
        window.history.replaceState(null, '', window.location.pathname);
      } else if (accessToken && type === 'signup') {
        toast({
          title: 'Email confirmed! 🎉',
          description: 'Your account has been successfully verified. Welcome to SpendWise!',
        });

        // Clean up the URL hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleRecoveryFromUrl();

    // Also listen for PASSWORD_RECOVERY event as fallback
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setIsRecoverySession(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  useEffect(() => {
    // Only redirect if user is logged in and NOT in password reset mode
    if (user && !isRecoverySession && mode !== 'reset') {
      navigate('/dashboard');
    }
  }, [user, navigate, isRecoverySession, mode]);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    } else if (urlMode === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    // Email validation only for login, signup, and forgot modes
    if (mode !== 'reset') {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.issues[0].message;
      }
    }

    // Password validation for login, signup, and reset modes
    if (mode !== 'forgot') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.issues[0].message;
      }
    }

    if (mode === 'signup') {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.issues[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          // Generally handle authentication errors with standard copy
          const authErr = error as unknown as { message?: string; status?: number; code?: string };

          // If the user tries to login but hasn't confirmed their email yet
          if (authErr.message?.toLowerCase().includes('email not confirmed')) {
            toast({
              title: 'Email not confirmed',
              description: 'Please check your inbox for a confirmation link before signing in.',
              variant: 'destructive',
            });
            return;
          }

          const isInvalidCredentials =
            authErr.status === 400 || authErr.code === 'invalid_credentials';

          if (isInvalidCredentials) {
            toast({
              title: 'Login failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/dashboard');
        }
      } else if (mode === 'signup') {
        const { error, data } = await signUp(email, password, fullName);
        if (error) {
          const authErr = error as unknown as { message?: string; status?: number; code?: string };
          const isAlreadyRegistered =
            authErr.status === 422 || authErr.code === 'user_already_exists';

          if (isAlreadyRegistered) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please login instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          // Check if email confirmation is required (session will be null if they need to verify)
          if (data && data.user && !data.session) {
            toast({
              title: 'Check your email!',
              description: 'We sent you a confirmation link. Please click it to verify your account.',
            });
            setMode('login'); // Switch to login so they can sign in after clicking the link
            return; // Don't navigate to dashboard
          }

          toast({
            title: 'Account created!',
            description: 'Welcome to SpendWise. Start tracking your expenses!',
          });
          navigate('/dashboard');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check your email',
            description: "We sent you a password reset link. If you don't see it in your inbox, please check your spam or junk folder.",
          });
          setMode('login');
        }
      } else if (mode === 'reset') {
        // Update password for recovery session
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast({
            title: 'Password update failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Password updated!',
            description: 'Your password has been successfully reset.',
          });
          setIsRecoverySession(false);
          // Sign out and redirect to login
          await supabase.auth.signOut();
          setMode('login');
          setPassword('');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Welcome back';
      case 'signup':
        return 'Create account';
      case 'forgot':
        return 'Reset password';
      case 'reset':
        return 'Set new password';
      default:
        return 'Welcome';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to access your expense tracker';
      case 'signup':
        return 'Start tracking your finances today';
      case 'forgot':
        return "Enter your email and we'll send you a reset link";
      case 'reset':
        return 'Enter your new password';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-2xl">SpendWise</h1>
          <p className="text-muted-foreground text-sm">Smart expense tracking</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-display">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>
              )}

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>
              )}

              {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                <div className="space-y-2">
                  <Label htmlFor="password">{mode === 'reset' ? 'New Password' : 'Password'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-sm">{errors.password}</p>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    {mode === 'login' && 'Sign in'}
                    {mode === 'signup' && 'Create account'}
                    {mode === 'forgot' && 'Send reset link'}
                    {mode === 'reset' && 'Update password'}
                  </>
                )}
              </Button>
            </form>

            {mode === 'forgot' && (
              <div className="flex items-center gap-1.5 justify-center mt-3 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <p>Check your spam or junk folder if you don't receive the email.</p>
              </div>
            )}

            <div className="mt-6 text-center text-sm">
              {mode === 'login' && (
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  onClick={() => setMode('login')}
                  className="flex items-center gap-1 mx-auto text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
