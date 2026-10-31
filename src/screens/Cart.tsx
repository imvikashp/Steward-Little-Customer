import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Loader2,
  Check,
  UtensilsCrossed,
  X,
} from 'lucide-react';

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
    totals,
    placeOrder,
  } = useApp();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [askTable, setAskTable] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableError, setTableError] = useState('');

  const goHome = () =>
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));

  const { tax, total: grandTotal } = totals;

  const openTablePrompt = () => {
    setError('');
    setTableError('');
    setAskTable(true);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (placing) return;
    const table = tableNumber.trim();
    if (!table) {
      setTableError('Please enter your table number');
      return;
    }
    setPlacing(true);
    setError('');
    setTableError('');
    try {
      // Writes the order into the Firestore `orders` collection against the
      // logged-in mobile number and table number, status "Order Confirmed".
      const id = await placeOrder(table);
      if (id) {
        setAskTable(false);
        window.dispatchEvent(
          new CustomEvent('navigate', { detail: 'order-status' })
        );
      } else {
        setTableError('Could not place the order. Please try again.');
      }
    } catch (err) {
      console.error('place order failed', err);
      setTableError('Could not reach the server. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onBack={goHome} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShoppingCart className="w-9 h-9 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 mt-1 mb-6">
            Add some delicious dishes to get started
          </p>
          <button
            onClick={goHome}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header onBack={goHome} />

      <main className="max-w-2xl mx-auto px-4 mt-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {cartCount} item{cartCount > 1 ? 's' : ''} in cart
        </h2>
        <p className="text-sm text-gray-500 mb-4">Review before you confirm</p>

        <div className="space-y-3">
          {cart.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-3"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-orange-600 font-bold mt-0.5">
                  ₹{item.price}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-orange-50 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    ₹{item.price * quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bill summary */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-3">Bill Details</h3>
          <div className="space-y-2 text-sm">
            <Row label="Item total" value={`₹${cartTotal}`} />
            <Row label="Taxes & charges (5%)" value={`₹${tax}`} />
            <div className="border-t border-dashed border-gray-200 my-2" />
            <div className="flex items-center justify-between font-bold text-gray-900 text-base">
              <span>To Pay</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Confirm bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {error && (
          <div className="max-w-2xl mx-auto px-4 pt-3">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Total amount</p>
            <p className="text-xl font-bold text-gray-900">₹{grandTotal}</p>
          </div>
          <button
            onClick={openTablePrompt}
            disabled={placing}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <Check className="w-5 h-5" />
            Confirm Order
          </button>
        </div>
      </div>

      {/* Table number prompt - asked right before the order is placed */}
      {askTable && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Enter Table Number
                </h2>
              </div>
              <button
                onClick={() => setAskTable(false)}
                disabled={placing}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              We will bring your food to this table.
            </p>

            <form onSubmit={handleConfirm}>
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={tableNumber}
                onChange={(e) => {
                  setTableNumber(e.target.value.replace(/\D/g, ''));
                  setTableError('');
                }}
                placeholder="e.g. 12"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 font-semibold text-lg tracking-wide text-center"
              />
              {tableError && (
                <p className="text-sm text-red-500 mt-2">{tableError}</p>
              )}

              <div className="flex items-center justify-between mt-5 mb-4 text-sm">
                <span className="text-gray-500">Total amount</span>
                <span className="font-bold text-gray-900">₹{grandTotal}</span>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {placing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Your Cart</h1>
      </div>
    </header>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-gray-600">
      <span>{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
