import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, ORDERS_COLLECTION, USERS_COLLECTION } from './firebase';
import type { AppUser, CartItem, FoodItem, Order } from './types';
import { calcTotals, FIRST_STATUS, normalizeStatus } from './restaurant';

interface AppContextValue {
  mobile: string | null;
  user: AppUser | null;
  login: (mobile: string) => Promise<void>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: FoodItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  totals: ReturnType<typeof calcTotals>;
  placeOrder: (tableNumber: string) => Promise<string | null>;
  orders: Order[];
  activeOrder: Order | null;
  ordersLoading: boolean;
  selectOrder: (id: string | null) => void;
  markOrderPaid: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const USER_KEY = 'spicejunction_user';
const ORDER_KEY = 'spicejunction_order';

/** Turns a raw Firestore document into an Order the UI can trust. */
function toOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    mobile: String(data.mobile ?? ''),
    tableNumber: String(data.tableNumber ?? ''),
    items: (data.items as CartItem[]) ?? [],
    subtotal: Number(data.subtotal ?? 0),
    tax: Number(data.tax ?? 0),
    total: Number(data.total ?? 0),
    status: normalizeStatus(data.status),
    paymentStatus: data.paymentStatus === 'Paid' ? 'Paid' : 'Pending',
    createdAt: Number(data.createdAt ?? 0),
    updatedAt: Number(data.updatedAt ?? 0),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState<string | null>(() =>
    localStorage.getItem(USER_KEY)
  );
  const [user, setUser] = useState<AppUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() =>
    localStorage.getItem(ORDER_KEY)
  );

  // Live profile for the logged-in number (users/{mobile}).
  useEffect(() => {
    if (!mobile) {
      setUser(null);
      return;
    }
    const unsub = onSnapshot(
      doc(db, USERS_COLLECTION, mobile),
      (snap) => {
        const data = snap.data();
        setUser(data ? ({ ...data, mobile } as AppUser) : null);
      },
      (err) => console.error('user snapshot failed', err)
    );
    return () => unsub();
  }, [mobile]);

  // Live list of the orders placed by this number. The status field is read
  // straight from Firestore, so whatever the restaurant sets there is what the
  // page shows - nothing moves forward on its own.
  useEffect(() => {
    if (!mobile) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('mobile', '==', mobile)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => toOrder(d.id, d.data()))
          .sort((a, b) => b.createdAt - a.createdAt);
        setOrders(list);
        setOrdersLoading(false);
      },
      (err) => {
        console.error('orders snapshot failed', err);
        setOrdersLoading(false);
      }
    );
    return () => unsub();
  }, [mobile]);

  // The order being tracked: the explicitly selected one, else the newest
  // order that has not been paid for yet.
  const activeOrder = useMemo(() => {
    if (orders.length === 0) return null;
    const selected = activeOrderId
      ? orders.find((o) => o.id === activeOrderId)
      : undefined;
    if (selected) return selected;
    return orders.find((o) => o.paymentStatus !== 'Paid') ?? null;
  }, [orders, activeOrderId]);

  const login = useCallback(async (num: string) => {
    const userRef = doc(db, USERS_COLLECTION, num);
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      // Same number logging in again - keep the existing document and its
      // history, only touch the login fields.
      await updateDoc(userRef, {
        lastLoginAt: Date.now(),
        lastLoginAtServer: serverTimestamp(),
        loginCount: increment(1),
      });
    } else {
      await setDoc(userRef, {
        mobile: num,
        createdAt: Date.now(),
        createdAtServer: serverTimestamp(),
        lastLoginAt: Date.now(),
        lastLoginAtServer: serverTimestamp(),
        loginCount: 1,
        totalOrders: 0,
        totalSpent: 0,
      });
    }
    setMobile(num);
    localStorage.setItem(USER_KEY, num);
  }, []);

  const logout = useCallback(() => {
    setMobile(null);
    setUser(null);
    setOrders([]);
    setActiveOrderId(null);
    setCart([]);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ORDER_KEY);
  }, []);

  const addToCart = (item: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.item.id === id ? { ...c, quantity: qty } : c))
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity * c.item.price, 0),
    [cart]
  );
  const totals = useMemo(() => calcTotals(cartTotal), [cartTotal]);

  const selectOrder = useCallback((id: string | null) => {
    setActiveOrderId(id);
    if (id) localStorage.setItem(ORDER_KEY, id);
    else localStorage.removeItem(ORDER_KEY);
  }, []);

  const placeOrder = useCallback(
    async (tableNumber: string): Promise<string | null> => {
    if (cart.length === 0 || !mobile) return null;
    const amounts = calcTotals(cartTotal);
    const now = Date.now();
    const ref = await addDoc(collection(db, ORDERS_COLLECTION), {
      mobile,
      tableNumber,
      items: cart.map(({ item, quantity }) => ({ item, quantity })),
      ...amounts,
      status: FIRST_STATUS,
      paymentStatus: 'Pending',
      createdAt: now,
      createdAtServer: serverTimestamp(),
      updatedAt: now,
    });
    // Store the id on the document too, so it is readable in the console.
    await updateDoc(ref, { orderId: ref.id });
    await setDoc(
      doc(db, USERS_COLLECTION, mobile),
      {
        mobile,
        totalOrders: increment(1),
        totalSpent: increment(amounts.total),
        lastOrderId: ref.id,
        lastOrderAt: now,
        lastTableNumber: tableNumber,
      },
      { merge: true }
    );
    selectOrder(ref.id);
    clearCart();
    return ref.id;
    },
    [cart, cartTotal, mobile, selectOrder]
  );

  const markOrderPaid = useCallback(async (id: string) => {
    await updateDoc(doc(db, ORDERS_COLLECTION, id), {
      paymentStatus: 'Paid',
      paidAt: Date.now(),
      updatedAt: Date.now(),
    });
  }, []);

  const value: AppContextValue = {
    mobile,
    user,
    login,
    logout,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    totals,
    placeOrder,
    orders,
    activeOrder,
    ordersLoading,
    selectOrder,
    markOrderPaid,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
