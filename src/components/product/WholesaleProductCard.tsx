import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import type { ProductWithDetails } from '../../types';

interface WholesaleProductCardProps {
  product: ProductWithDetails;
}

export default function WholesaleProductCard({ product }: WholesaleProductCardProps) {
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

  // Calculate total stock from inventory
  const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);

  const getStockStatus = () => {
    if (totalStock <= 0) return { label: 'Out of Stock', color: 'bg-red-500/90 text-white' };
    if (totalStock < 20) return { label: 'Low Stock', color: 'bg-amber-500/90 text-white' };
    return { label: 'In Stock', color: 'bg-emerald-500/90 text-white' };
  };

  const stockStatus = getStockStatus();

  return (
    <Link
      to={`/wholesale/product/${product.slug}`}
      className="group block"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          ) : (
            <img
              src={`https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80&auto=format&fit=crop`}
              alt="Placeholder fashion model"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out opacity-90"
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* MOQ Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gray-900/85 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <Package className="w-3.5 h-3.5" />
            MOQ: {product.moq} pcs
          </div>

          {/* Stock Status Badge */}
          <div className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${stockStatus.color}`}>
            {stockStatus.label}
          </div>

          {/* Category badge on hover */}
          {product.category && (
            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              {product.category.name}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {product.name}
          </h3>

          {product.short_description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {product.short_description}
            </p>
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Colors:</span>
              {product.colors.slice(0, 6).map((color) => (
                <div
                  key={color.id}
                  className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: color.color_hex }}
                  title={color.color_name}
                />
              ))}
              {product.colors.length > 6 && (
                <span className="text-xs text-gray-400">+{product.colors.length - 6}</span>
              )}
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Sizes:</span>
              {product.sizes.slice(0, 5).map((size) => (
                <span
                  key={size.id}
                  className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                >
                  {size.size_label}
                </span>
              ))}
              {product.sizes.length > 5 && (
                <span className="text-xs text-gray-400">+{product.sizes.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
