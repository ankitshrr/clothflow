import type { ProductWithDetails } from '../../types';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';

interface ProductGridProps {
  products: ProductWithDetails[];
  loading?: boolean;
  onAddToCart?: (product: ProductWithDetails) => void;
  onToggleWishlist?: (productId: string) => void;
  wishlistedProducts?: string[];
}

export default function ProductGrid({
  products,
  loading,
  onAddToCart,
  onToggleWishlist,
  wishlistedProducts = [],
}: ProductGridProps) {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart?.(product)}
          onToggleWishlist={() => onToggleWishlist?.(product.id)}
          isWishlisted={wishlistedProducts.includes(product.id)}
        />
      ))}
    </div>
  );
}
