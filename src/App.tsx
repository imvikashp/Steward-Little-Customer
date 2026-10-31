import { useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from '@/lib/AppContext';
import Login from '@/screens/Login';
import Home from '@/screens/Home';
import Cart from '@/screens/Cart';
import OrderStatus from '@/screens/OrderStatus';
import Payment from '@/screens/Payment';

type Screen = 'home' | 'cart' | 'order-status' | 'payment';

function Router() {
  const { mobile, activeOrder } = useApp();
  const [screen, setScreen] = useState<Screen>('home');
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Screen;
      setScreen(detail);
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  // Reset to home whenever a user logs in or out
  useEffect(() => {
    setScreen('home');
    openedFor.current = null;
  }, [mobile]);

  // When an unpaid order is found for this number (for example after logging
  // back in), open the tracking screen once. After that the user is free to
  // move around - nothing pulls them back automatically.
  useEffect(() => {
    if (!activeOrder || activeOrder.paymentStatus === 'Paid') return;
    if (openedFor.current === activeOrder.id) return;
    openedFor.current = activeOrder.id;
    setScreen('order-status');
  }, [activeOrder]);

  if (!mobile) return <Login />;

  switch (screen) {
    case 'cart':
      return <Cart />;
    case 'order-status':
      return <OrderStatus />;
    case 'payment':
      return <Payment />;
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
