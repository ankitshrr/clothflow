import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ProductWithDetails, Category } from '../types';
import { ProductGrid } from '../components/product';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Filter, SortAsc } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);

    let query = supabase
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
      .eq('is_active', true);

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        query = query.order('base_price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('base_price', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data } = await query;

    if (data) {
      setProducts(data as ProductWithDetails[]);
    }

    setLoading(false);
  };

  const handleAddToCart = async (product: ProductWithDetails) => {
    await addToCart(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">{products.length} products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-500"
                    />
                    <span className="ml-2 text-gray-700">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="h-4 w-4 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <ProductGrid
              products={products}
              loading={loading}
              onAddToCart={handleAddToCart}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
