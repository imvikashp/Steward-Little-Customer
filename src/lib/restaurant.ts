export const RESTAURANT_NAME = 'Spice Junction';
export const RESTAURANT_UPI_ID = 'spicejunction@upi';
export const RESTAURANT_PHONE = '+91 98765 43210';
export const RESTAURANT_ADDRESS = '12 MG Road, Bengaluru, KA 560001';

// The exact strings written to / read from the `status` field of a Firestore
// order document. The restaurant moves an order forward by editing this field
// in the Firebase console — nothing advances on its own.
export const ORDER_STATUSES = [
  'Order Confirmed',
  'Food Preparing',
  'Food Prepared',
  'Food On The Way',
  'Delivered',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FIRST_STATUS: OrderStatus = 'Order Confirmed';
export const FINAL_STATUS: OrderStatus = 'Delivered';

/**
 * Maps whatever sits in the Firestore `status` field onto a known status.
 * Tolerates casing/spacing differences so a hand-typed value still renders.
 * Unknown values fall back to the first status instead of breaking the page.
 */
export function normalizeStatus(raw: unknown): OrderStatus {
  if (typeof raw !== 'string') return FIRST_STATUS;
  const key = raw.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  const match = ORDER_STATUSES.find(
    (s) => s.toLowerCase() === key
  );
  return match ?? FIRST_STATUS;
}

export function statusIndex(status: OrderStatus): number {
  return ORDER_STATUSES.indexOf(status);
}

export const TAX_RATE = 0.05;

export function calcTotals(subtotal: number) {
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}
