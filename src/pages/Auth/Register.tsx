import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Register: React.FC = () => {
  const { signUpWithEmail, signInWithGoogle, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUpWithEmail(email, password, name);
    setLoading(false);

    if (authError) {
      setError(authError.message || 'Failed to register');
    } else {
      navigate('/onboarding');
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message || 'Google sign-in failed');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5EFE7] dark:bg-[#17251D] transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle showLabel />
      </div>

      <div className="w-full max-w-md bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] rounded-3xl p-8 sm:p-10 shadow-elevated">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#755744] dark:bg-[#3F6650] mx-auto flex items-center justify-center text-white mb-3 shadow-subtle">
            <Sparkles className="w-6 h-6 text-[#C8AD96] dark:text-[#A7BDA9]" />
          </div>
          <h1 className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Begin Your Journey
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Create your private language learning progress tracker
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Vance"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
              />
              <User className="w-4 h-4 text-[#766456] dark:text-[#9CB29F] absolute left-3.5 top-3" />
            </div>
          </div>

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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Password
            </label>
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
              />
              <Lock className="w-4 h-4 text-[#766456] dark:text-[#9CB29F] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Continue to Setup'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E4D7CC] dark:bg-[#2C4236]" />
          <span className="text-[11px] uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] font-semibold">
            Or
          </span>
          <div className="flex-1 h-px bg-[#E4D7CC] dark:bg-[#2C4236]" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full py-2.5 px-4 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-sm font-semibold text-[#352820] dark:text-[#E8F0E8] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign Up with Google
        </button>

        <p className="mt-5 text-center text-xs text-[#766456] dark:text-[#9CB29F]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#755744] dark:text-[#A7BDA9] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
