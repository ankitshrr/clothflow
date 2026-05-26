import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RefreshCw, Shield, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithDetails, Category } from '../types';
import { ProductGrid } from '../components/product';
import { useCart } from '../hooks/useCart';
import Button from '../components/ui/Button';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    setLoading(true);

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select(`
          *,
          category:categories (*),
          images:product_images (*),
          sizes:product_sizes (*),
          colors:product_colors (*),
          inventory (*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8),
      supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
    ]);

    if (productsRes.data) {
      setFeaturedProducts(productsRes.data as ProductWithDetails[]);
    }

    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }

    setLoading(false);
  };

  const handleAddToCart = async (product: ProductWithDetails) => {
    await addToCart(product);
  };

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Premium Men's
                <br />
                Fashion in Nepal
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Quality men's clothing for every occasion. T-shirts, shirts, tracks, jackets, and sportswear.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg">
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/stores">
                  <Button variant="outline" size="lg" className="dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900">
                    Visit Our Store
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1490578474892-0c6886c0a27e?w=800"
                alt="Men's fashion"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
            <p className="text-gray-600 dark:text-gray-300">Explore our men's fashion categories</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                {category.image_url && (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-200">Shop Now</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-300">Handpicked items just for you</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="dark:border-white dark:text-white">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <ProductGrid
            products={featuredProducts}
            loading={loading}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Within Kathmandu Valley</p>
            </div>

            <div>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">7-day return policy</p>
            </div>

            <div>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Guarantee</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Premium materials only</p>
            </div>

            <div>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Best Prices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Competitive pricing</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Visit Our Store</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Come visit our store at Pepsi-Cola, Kathmandu. Experience our collection in person and get expert styling advice.
          </p>
          <Link to="/stores">
            <Button variant="secondary" size="lg">
              Get Directions
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
