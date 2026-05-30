import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight, Minus, Plus, Star, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithDetails, Review, StoreLocation } from '../types';
import { formatPrice, calculateDiscount } from '../lib/utils';
import { useCart } from '../hooks/useCart';
import Button from '../components/ui/Button';

import Loading from '../components/ui/Loading';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState<number>(0);
  const { addToCart } = useCart();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      checkStock();
    }
  }, [product, selectedSize, selectedColor]);

  const fetchProduct = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('products')
      .select(
        `
        *,
        category:categories (*),
        images:product_images (*),
        sizes:product_sizes (*),
        colors:product_colors (*),
        inventory (*)
      `
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setProduct(data as ProductWithDetails);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', data.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData);

      const { data: storesData } = await supabase
        .from('store_locations')
        .select('*')
        .eq('is_active', true);

      if (storesData) setStores(storesData);

      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0].id);
      }
    }

    setLoading(false);
  };

  const checkStock = async () => {
    if (!product) return;

    const sizeObj = product.sizes.find((s) => s.id === selectedSize);
    const colorObj = product.colors.find((c: any) => c.id === selectedColor) as any;

    if (!sizeObj && !colorObj && product.sizes.length === 0) {
      const { data } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', product.id)
        .is('size_id', null)
        .is('color_id', colorObj ? colorObj.id : null)
        .maybeSingle();


      if (data) setStock(data.quantity);
    } else if (selectedSize && selectedColor) {
      const { data } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', product.id)
        .eq('size_id', selectedSize)
        .eq('color_id', selectedColor)
        .maybeSingle();

      if (data) setStock(data.quantity);
      else setStock(0);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if ((product.sizes.length > 0 || product.colors.length > 0) && (!selectedSize && !selectedColor)) {
      alert('Please select size and color');
      return;
    }

    const size = product.sizes.find((s) => s.id === selectedSize);
    const color = product.colors.find((c) => c.id === selectedColor);

    await addToCart(product, size, color, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        </div>
      </div>
    );
  }

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
  const discount = calculateDiscount(product.base_price, product.sale_price || 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <a href="/" className="hover:text-gray-900">
            Home
          </a>
          <ChevronRight className="w-4 h-4" />
          <a href="/products" className="hover:text-gray-900">
            Products
          </a>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <a href={`/category/${product.category.slug}`} className="hover:text-gray-900">
                {product.category.name}
              </a>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            <div>
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {product.images.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover hover:opacity-75 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(avgRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {avgRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.sale_price || product.base_price)}
                </span>
                {product.sale_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.base_price)}
                    </span>
                    <span className="text-sm font-semibold text-red-600">Save {discount}%</span>
                  </>
                )}
              </div>

              <p className="text-gray-700 mb-8">{product.description}</p>

              {product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.id
                            ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.color_hex }}
                        title={color.color_name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Selected:{' '}
                    {product.colors.find((c) => c.id === selectedColor)?.color_name ||
                      'None'}
                  </p>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-4 py-2 border-2 rounded-lg transition-all ${
                          selectedSize === size.id
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 hover:border-gray-900'
                        }`}
                      >
                        {size.size_label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(product.sizes.length > 0 || product.colors.length > 0) &&
                selectedSize &&
                selectedColor && (
                  <div className="mb-6 text-sm">
                    {stock > 0 ? (
                      <span className="text-green-600 font-medium">{stock} in stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of stock</span>
                    )}
                  </div>
                )}

              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1"
                  disabled={stock === 0 && product.sizes.length > 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                  )}
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {stores.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available at Our Stores</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.slice(0, 3).map((store) => (
                <div key={store.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      {store.address}, {store.city}, {store.state}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 font-medium hover:underline"
                  >
                    View on Map
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
