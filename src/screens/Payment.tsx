import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '@/lib/AppContext';
import { RESTAURANT_NAME, RESTAURANT_UPI_ID } from '@/lib/restaurant';
import {
  QrCode,
  CheckCircle2,
  Loader2,
  LogOut,
  Clock,
} from 'lucide-react';

type PayState = 'idle' | 'verifying' | 'paid';

export default function Payment() {
  const { activeOrder, logout, markOrderPaid } = useApp();
  const [state, setState] = useState<PayState>('idle');
  const [countdown, setCountdown] = useState(8);
  const [error, setError] = useState('');

  const goToHome = () =>
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));

  const upiString = activeOrder
    ? `upi://pay?pa=${RESTAURANT_UPI_ID}&pn=${encodeURIComponent(
        RESTAURANT_NAME
      )}&am=${activeOrder.total}&cu=INR&tn=Order${activeOrder.id.slice(-6)}`
    : '';

  const handlePay = async () => {
    if (state !== 'idle' || !activeOrder) return;
    setState('verifying');
    setError('');
    try {
      // Records the payment on the Firestore order document.
      await markOrderPaid(activeOrder.id);
      setState('paid');
    } catch (err) {
      console.error('marking order paid failed', err);
      setError('Could not confirm the payment. Please try again.');
      setState('idle');
    }
  };

  // auto-logout countdown after payment confirmed
  useEffect(() => {
    if (state !== 'paid') return;
    setCountdown(8);
    const interval = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(interval);
          logout();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state, logout]);

  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500 mb-4">No order to pay for</p>
        <button
          onClick={goToHome}
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50/50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="font-bold text-gray-900 text-lg text-center">Payment</h1>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6">
        {state !== 'paid' ? (
          <>
            {/* Amount */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Amount to pay</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">
                ₹{activeOrder.total}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Order #{activeOrder.id.slice(-6).toUpperCase()}
              </p>
            </div>

            {/* QR card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-black/5 p-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
                <QrCode className="w-4 h-4" />
                Scan to pay with any UPI app
              </div>

              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-gray-100">
                <QRCodeSVG value={upiString} size={200} includeMargin={false} level="M" />
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Pay to:{' '}
                <span className="font-semibold text-gray-900">
                  {RESTAURANT_NAME}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{RESTAURANT_UPI_ID}</p>

              <button
                onClick={handlePay}
                disabled={state === 'verifying'}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {state === 'verifying' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    I've Paid
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-center text-sm text-red-500 mt-4">{error}</p>
            )}

            <p className="text-center text-xs text-gray-400 mt-4">
              Open GPay, PhonePe, Paytm or any UPI app and scan the QR above
            </p>
          </>
        ) : (
          // Thank you screen
          <div className="flex-1 flex flex-col items-center justify-center text-center pt-10">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-[pop_0.4s_ease-out]">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Payment Successful!
            </h2>
            <p className="text-gray-500 mt-2 max-w-xs">
              Thank you for coming to {RESTAURANT_NAME}. We hope you enjoyed your
              meal — see you again soon!
            </p>

            <div className="mt-6 bg-white rounded-2xl border border-gray-100 px-6 py-4 text-center">
              <p className="text-sm text-gray-500">Amount paid</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{activeOrder.total}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Auto logout in{' '}
                <span className="font-bold text-gray-700">{countdown}s</span>
              </span>
            </div>

            <button
              onClick={logout}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
