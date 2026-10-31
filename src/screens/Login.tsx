import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { RESTAURANT_NAME } from '@/lib/restaurant';
import { UtensilsCrossed, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const [num, setNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Creates users/{mobile} in Firestore the first time, and reuses the
      // same document on every later login with that number.
      await login(cleaned);
    } catch (err) {
      console.error('login failed', err);
      setError('Could not connect to the server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 mb-4">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{RESTAURANT_NAME}</h1>
          <p className="text-gray-500 mt-1">Fresh, hot &amp; on time</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8 border border-orange-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your mobile number to start ordering
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  +91
                </span>
                <Phone className="absolute left-14 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={num}
                  onChange={(e) => setNum(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full pl-24 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 font-medium tracking-wide"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Go to Menu
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            By continuing you agree to our Terms &amp; Conditions
          </p>
        </div>
      </div>
    </div>
  );
}
