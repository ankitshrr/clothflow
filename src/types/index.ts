import type { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type Category = Tables<'categories'>;
export type Product = Tables<'products'>;
export type ProductImage = Tables<'product_images'>;
export type ProductSize = Tables<'product_sizes'>;
export type ProductColor = Tables<'product_colors'>;
export type Inventory = Tables<'inventory'>;
export type CartItem = Tables<'cart_items'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type StoreLocation = Tables<'store_locations'>;
export type Review = Tables<'reviews'>;
export type Wishlist = Tables<'wishlists'>;
export type Inquiry = Tables<'inquiries'>;

export interface ProductWithDetails extends Product {
  category: Category | null;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  inventory: Inventory[];
}

export interface CartItemWithDetails extends CartItem {
  product: ProductWithDetails;
  size: ProductSize | null;
  color: ProductColor | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export interface InquiryWithProduct extends Inquiry {
  product: Product;
  size: ProductSize | null;
  color: ProductColor | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  avatar_url: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItemWithProduct extends Wishlist {
  product: ProductWithDetails;
}
