import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await resetPasswordForEmail(email);
    setLoading(false);

    if (resetError) {
      setError(resetError.message || 'Failed to send reset link');
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5EFE7] dark:bg-[#17251D] transition-colors">
      <div className="w-full max-w-md bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] rounded-3xl p-8 sm:p-10 shadow-elevated">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#755744] dark:bg-[#3F6650] mx-auto flex items-center justify-center text-white mb-3 shadow-subtle">
            <Sparkles className="w-6 h-6 text-[#C8AD96] dark:text-[#A7BDA9]" />
          </div>
          <h1 className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Reset Password
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Reset Link Dispatched
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              If an account exists for {email}, a password reset link has been dispatched.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-xs font-semibold text-[#755744] dark:text-[#A7BDA9] underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Account Email
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Recovery Email'}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#766456] dark:text-[#9CB29F] hover:text-[#352820] dark:hover:text-[#E8F0E8]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
