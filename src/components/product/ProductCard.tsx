import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { ProductWithDetails } from '../../types';
import { calculateDiscount } from '../../lib/utils';

import Button from '../ui/Button';

interface ProductCardProps {
  product: ProductWithDetails;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
  const discount = calculateDiscount(product.base_price, product.sale_price || 0);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Link to={`/product/${product.slug}`}>
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">No image</span>
            </div>
          )}
        </Link>

        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}

        {onToggleWishlist && (
          <button
            onClick={onToggleWishlist}
            className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'
              }`}
            />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={onAddToCart}
            size="sm"
            className="w-full"
            variant="secondary"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.category.name}</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {product.sale_price ? (
            <>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Rs. {product.sale_price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                Rs. {product.base_price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Rs. {product.base_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
