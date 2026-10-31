import { useMemo, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { CATEGORIES, FOOD_ITEMS } from '@/lib/foodData';
import { RESTAURANT_NAME } from '@/lib/restaurant';
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  UtensilsCrossed,
  Leaf,
  Search,
} from 'lucide-react';

export default function Home() {
  const { cart, addToCart, updateQuantity, cartCount, mobile, logout, activeOrder } =
    useApp();
  const [activeCat, setActiveCat] = useState<string>('morning');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return FOOD_ITEMS.filter((f) => {
      const inCat = f.category === activeCat;
      const inSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase());
      return inCat && inSearch;
    });
  }, [activeCat, search]);

  const qtyOf = (id: string) =>
    cart.find((c) => c.item.id === id)?.quantity ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 truncate">{RESTAURANT_NAME}</h1>
              <p className="text-xs text-gray-500 truncate">+91 {mobile}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'cart' }));
              }}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 flex items-center justify-center text-xs font-bold text-white bg-orange-600 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 focus:bg-white border border-transparent focus:border-orange-300 focus:ring-2 focus:ring-orange-500/15 outline-none text-sm transition-all"
            />
          </div>
        </div>
      </header>

      {/* Live order banner - status comes from Firestore */}
      {activeOrder && activeOrder.paymentStatus !== 'Paid' && (
        <section className="max-w-5xl mx-auto px-4 mt-4">
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('navigate', { detail: 'order-status' })
              )
            }
            className="w-full flex items-center justify-between gap-3 rounded-2xl bg-white border border-orange-200 px-4 py-3 text-left hover:bg-orange-50 transition-colors"
          >
            <span className="min-w-0">
              <span className="block text-xs text-gray-500">
                Order #{activeOrder.id.slice(-6).toUpperCase()}
              </span>
              <span className="block font-semibold text-gray-900 truncate">
                {activeOrder.status}
              </span>
            </span>
            <span className="text-sm font-semibold text-orange-600 shrink-0">
              Track
            </span>
          </button>
        </section>
      )}

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 mt-4">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Today's fresh picks
            </h2>
            <p className="text-orange-50 mt-1 text-sm sm:text-base">
              Hot meals for every time of day
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-10 top-2 w-24 h-24 rounded-full bg-white/10" />
        </div>
      </section>

      {/* Category tabs */}
      <nav className="sticky top-[113px] z-20 bg-gray-50/95 backdrop-blur-sm mt-5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeCat === cat.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Food grid */}
      <main className="max-w-5xl mx-auto px-4 mt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No dishes found</p>
            <p className="text-sm mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((food) => {
              const qty = qtyOf(food.id);
              return (
                <article
                  key={food.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={food.image}
                      alt={food.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 backdrop-blur text-xs font-semibold text-gray-700">
                      <Leaf className="w-3 h-3 text-green-600" />
                      {food.veg ? 'Veg' : 'Non-Veg'}
                    </span>
                    {qty > 0 && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-green-600 text-xs font-semibold text-white">
                        <Check className="w-3 h-3" />
                        {qty} added
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 leading-snug">
                        {food.name}
                      </h3>
                      <span className="font-bold text-orange-600 whitespace-nowrap">
                        ₹{food.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {food.description}
                    </p>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(food)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-sm transition-colors active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-orange-50 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(food.id, qty - 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-900">{qty}</span>
                        <button
                          onClick={() => addToCart(food)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


