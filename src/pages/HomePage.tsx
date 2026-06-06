import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RefreshCw, Shield, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithDetails, Category } from '../types';
import { ProductGrid } from '../components/product';
import { useCart } from '../hooks/useCart';
import Button from '../components/ui/Button';
import AnimateOnScroll from '../components/ui/AnimateOnScroll';

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
            <AnimateOnScroll animation="slide-in-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Reeback
                <br />
                Fashion in Nepal
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Quality fashion for every occasion. T-shirts, shirts, tracks, jackets, and sportswear.
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
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-in-right" delay={200} className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1490578474892-0c6886c0a27e?w=800"
                alt="Fashion"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
            <p className="text-gray-600 dark:text-gray-300">Explore our fashion categories</p>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <AnimateOnScroll key={category.id} delay={index * 100}>
                <Link
                  to={`/category/${category.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 block"
                >
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500&q=80&auto=format&fit=crop"
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-200">Shop Now</p>
                    </div>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="flex items-center justify-between mb-12">
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
          </AnimateOnScroll>

          <ProductGrid
            products={featuredProducts}
            loading={loading}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* Wholesale Banner Section */}
      <section className="py-20 bg-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&q=80" 
            alt="Wholesale background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Looking to Buy in Bulk?
            </h2>
            <p className="text-emerald-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Get special wholesale pricing for your business. Partner with Reeback Fashion to stock your store with premium quality clothing.
            </p>
            <Link to="/wholesale">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-gray-100 border-transparent shadow-xl">
                Explore Wholesale Catalog
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <AnimateOnScroll delay={100}>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Within Kathmandu Valley</p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">7-day return policy</p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300}>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Guarantee</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Premium materials only</p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={400}>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Best Prices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Competitive pricing</p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 dark:bg-black transition-colors">
        <AnimateOnScroll className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" animation="fade-up">
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
        </AnimateOnScroll>
      </section>
    </div>
  );
}
