export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  headline?: string | null;
  description: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  specs?: Record<string, string>;
  badge?: string | null;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: string | Date | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  maxStock: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isPaid: boolean;
  paidAt?: string | null;
  createdAt: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: {
    id: string;
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image?: string | null;
  }[];
}
