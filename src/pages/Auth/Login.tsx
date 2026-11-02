import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Login: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signInWithEmail(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message || 'Failed to sign in. Please check credentials.');
    } else {
      navigate('/');
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message || 'Google sign-in failed');
    } else {
      navigate('/');
    }
  };

  const handleDemo = () => {
    enterDemoMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5EFE7] dark:bg-[#17251D] transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle showLabel />
      </div>

      <div className="w-full max-w-md bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] rounded-3xl p-8 sm:p-10 shadow-elevated">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#755744] dark:bg-[#3F6650] mx-auto flex items-center justify-center text-white mb-3 shadow-subtle">
            <Sparkles className="w-6 h-6 text-[#C8AD96] dark:text-[#A7BDA9]" />
          </div>
          <h1 className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Welcome Back
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Log in to continue your language learning journey
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
              />
              <Mail className="w-4 h-4 text-[#766456] dark:text-[#9CB29F] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#755744] dark:text-[#A7BDA9] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
              />
              <Lock className="w-4 h-4 text-[#766456] dark:text-[#9CB29F] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E4D7CC] dark:bg-[#2C4236]" />
          <span className="text-[11px] uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] font-semibold">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-[#E4D7CC] dark:bg-[#2C4236]" />
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full py-2.5 px-4 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-sm font-semibold text-[#352820] dark:text-[#E8F0E8] transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google Sign-In
        </button>

        {/* Demo Mode Button */}
        <button
          type="button"
          onClick={handleDemo}
          className="w-full py-2 px-4 rounded-xl border border-dashed border-[#C8AD96] dark:border-[#3F6650] text-[#755744] dark:text-[#A7BDA9] hover:bg-[#EFE7DF]/50 dark:hover:bg-[#203128] text-xs font-medium transition-colors"
        >
          Explore with Preloaded Demo Data
        </button>

        <p className="mt-6 text-center text-xs text-[#766456] dark:text-[#9CB29F]">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#755744] dark:text-[#A7BDA9] hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
