import { useMemo } from 'react';
import { useApp } from '@/lib/AppContext';
import { ORDER_STATUSES, statusIndex } from '@/lib/restaurant';
import type { OrderStatus as OrderStatusValue } from '@/lib/restaurant';
import {
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Bike,
  Home as HomeIcon,
  Receipt,
  RefreshCw,
} from 'lucide-react';

const STATUS_ICONS: Record<OrderStatusValue, typeof CheckCircle2> = {
  'Order Confirmed': CheckCircle2,
  'Food Preparing': ChefHat,
  'Food Prepared': PackageCheck,
  'Food On The Way': Bike,
  Delivered: HomeIcon,
};

const STATUS_NOTES: Record<OrderStatusValue, string> = {
  'Order Confirmed': 'The restaurant has received your order',
  'Food Preparing': 'Your food is being cooked right now',
  'Food Prepared': 'Your food is ready and being packed',
  'Food On The Way': 'Your order has left the kitchen',
  Delivered: 'Enjoy your meal!',
};

export default function OrderStatus() {
  const { activeOrder, ordersLoading } = useApp();

  const currentIdx = useMemo(
    () => (activeOrder ? statusIndex(activeOrder.status) : -1),
    [activeOrder]
  );

  const goHome = () =>
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));

  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-500 mb-4">
          {ordersLoading ? 'Loading your order...' : 'No active order found'}
        </p>
        <button
          onClick={goHome}
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const isDelivered = activeOrder.status === 'Delivered';
  const placedAt = activeOrder.createdAt
    ? new Date(activeOrder.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-gray-900 text-lg">Order Tracking</h1>
          <div className="text-right">
            <span className="block text-xs font-medium text-gray-400">
              #{activeOrder.id.slice(-6).toUpperCase()}
            </span>
            {activeOrder.tableNumber && (
              <span className="block text-xs font-semibold text-orange-600">
                Table {activeOrder.tableNumber}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-4">
        {/* Status banner - driven entirely by the Firestore `status` field */}
        <div
          className={`rounded-2xl p-6 text-white text-center mb-5 transition-colors ${
            isDelivered
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-orange-500 to-red-500'
          }`}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-3">
            {(() => {
              const Icon = STATUS_ICONS[activeOrder.status];
              return <Icon className="w-7 h-7" />;
            })()}
          </div>
          <h2 className="text-xl font-bold">{activeOrder.status}</h2>
          <p className="text-white/80 text-sm mt-1">
            {STATUS_NOTES[activeOrder.status]}
          </p>
          <p className="text-white/60 text-xs mt-2">
            {activeOrder.tableNumber && `Table ${activeOrder.tableNumber}`}
            {activeOrder.tableNumber && placedAt && ' · '}
            {placedAt && `Placed at ${placedAt}`}
          </p>
        </div>

        {/* Progress stepper */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="space-y-0">
            {ORDER_STATUSES.map((status, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              const Icon = STATUS_ICONS[status];
              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        done
                          ? 'bg-green-500 text-white'
                          : active
                          ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {idx < ORDER_STATUSES.length - 1 && (
                      <div
                        className={`w-0.5 h-10 ${
                          done ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-2 pb-8">
                    <p
                      className={`font-semibold ${
                        done || active ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {status}
                    </p>
                    {active && !isDelivered && (
                      <p className="text-sm text-orange-500 mt-0.5">
                        In progress...
                      </p>
                    )}
                    {done && (
                      <p className="text-sm text-green-600 mt-0.5">Done</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isDelivered && (
            <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
              <RefreshCw className="w-3.5 h-3.5" />
              This updates live when the restaurant changes your order status
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            Order Summary
          </h3>
          <div className="space-y-2 text-sm">
            {activeOrder.items.map(({ item, quantity }) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-gray-600">
                  {item.name} × {quantity}
                </span>
                <span className="font-medium text-gray-900">
                  ₹{item.price * quantity}
                </span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-200 my-2" />
            <div className="flex items-center justify-between text-gray-600">
              <span>Item total</span>
              <span className="font-medium text-gray-900">
                ₹{activeOrder.subtotal}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Taxes &amp; charges</span>
              <span className="font-medium text-gray-900">
                ₹{activeOrder.tax}
              </span>
            </div>
            <div className="border-t border-dashed border-gray-200 my-2" />
            <div className="flex items-center justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>₹{activeOrder.total}</span>
            </div>
          </div>
        </div>

        {/* Action */}
        {isDelivered && activeOrder.paymentStatus !== 'Paid' ? (
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('navigate', { detail: 'payment' })
              )
            }
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all active:scale-[0.98]"
          >
            Proceed to Payment
          </button>
        ) : (
          <button
            onClick={goHome}
            className="w-full py-3.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
          >
            Back to Menu
          </button>
        )}
      </main>
    </div>
  );
}
