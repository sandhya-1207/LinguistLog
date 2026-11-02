import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
    const { error: updateError } = await updateUserPassword(password);
    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Failed to update password');
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5EFE7] dark:bg-[#17251D] transition-colors">
      <div className="w-full max-w-md bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] rounded-3xl p-8 sm:p-10 shadow-elevated">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Set New Password
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Choose a strong password to protect your study data
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Password Updated!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Redirecting you to dashboard...
            </p>
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
                New Password
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
                Confirm New Password
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
              className="w-full py-2.5 px-4 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Updating...' : 'Update Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
