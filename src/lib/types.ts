import type { OrderStatus } from './restaurant';

export type CategoryId =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'dinner'
  | 'drinks'
  | 'chats';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  image: string;
  veg: boolean;
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

export type PaymentStatus = 'Pending' | 'Paid';

/** Shape of a document in the Firestore `orders` collection. */
export interface Order {
  id: string;
  mobile: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: number;
  updatedAt: number;
}

/** Shape of a document in the Firestore `users` collection (id = mobile). */
export interface AppUser {
  mobile: string;
  createdAt: number;
  lastLoginAt: number;
  loginCount: number;
  totalOrders: number;
  totalSpent: number;
}
