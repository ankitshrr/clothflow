import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { WishlistItemWithProduct } from '../types';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products (
          *,
          category:categories (*),
          images:product_images (*),
          sizes:product_sizes (*),
          colors:product_colors (*),
          inventory (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWishlistItems(data as unknown as WishlistItemWithProduct[]);
    }
    
    setLoading(false);
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return { error: new Error('User must be logged in') };

    const { error } = await supabase
      .from('wishlists')
      .insert([
        { user_id: user.id, product_id: productId }
      ]);

    if (!error) {
      fetchWishlist();
    }
    
    return { error };
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return { error: new Error('User must be logged in') };

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    }

    return { error };
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };
}
