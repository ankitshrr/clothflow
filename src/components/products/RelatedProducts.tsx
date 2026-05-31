import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductWithDetails } from '../../types';
import ProductGrid from '../product/ProductGrid';
import { useCart } from '../../hooks/useCart';

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (categoryId && currentProductId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (*),
          images:product_images (*),
          sizes:product_sizes (*),
          colors:product_colors (*),
          inventory (*)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .neq('id', currentProductId)
        .limit(4);

      if (error) throw error;
      
      setProducts(data as ProductWithDetails[]);
    } catch (err) {
      console.error('Error fetching related products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: ProductWithDetails) => {
    await addToCart(product);
  };

  if (!loading && products.length === 0) {
    return null; // Don't show the section if there are no related products
  }

  return (
    <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        You Might Also Like
      </h2>
      <ProductGrid 
        products={products} 
        loading={loading} 
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
