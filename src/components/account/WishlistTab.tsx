import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { ProductCard } from '../product';
import Button from '../ui/Button';

export function WishlistTab() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-6 max-w-sm">
          Looks like you haven't added any items to your wishlist yet.
        </p>
        <Link to="/products">
          <Button>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
          <p className="text-sm text-gray-500 mt-1">Saved items you want to buy later.</p>
        </div>
        <div className="text-sm font-medium text-primary bg-blue-50 px-3 py-1 rounded-full">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard product={item.product} />
            <button
              onClick={() => removeFromWishlist(item.product_id)}
              className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
