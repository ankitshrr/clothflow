import { useState, useEffect, createContext, useContext } from 'react';
import type { CartItemWithDetails, Product, ProductSize, ProductColor } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from '../components/ui/Toast';

interface CartContextType {
  items: CartItemWithDetails[];
  loading: boolean;
  totalItems: number;
  subtotal: number;
  addToCart: (product: Product, size?: ProductSize, color?: ProductColor, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.base_price;
    return sum + price * item.quantity;
  }, 0);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          *,
          category:categories (*),
          images:product_images (*),
          sizes:product_sizes (*),
          colors:product_colors (*),
          inventory (*)
        ),
        size:product_sizes (*),
        color:product_colors (*)
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      setItems(data as CartItemWithDetails[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product: Product, size?: ProductSize, color?: ProductColor, quantity: number = 1) => {
    if (!user) {
      showToast('Please sign in to add items to cart', 'error');
      throw new Error('Please sign in to add items to cart');
    }

    const existingItem = items.find(
      (item) =>
        item.product_id === product.id &&
        item.size_id === (size?.id || null) &&
        item.color_id === (color?.id || null)
    );

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      showToast('Added to cart', 'success');
    } else {
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        size_id: size?.id || null,
        color_id: color?.id || null,
        quantity,
      });

      if (!error) {
        await fetchCart();
        showToast('Added to cart', 'success');
      } else {
        showToast('Failed to add to cart', 'error');
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (!error) {
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setItems([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
