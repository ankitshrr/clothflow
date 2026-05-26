import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithDetails, Category } from '../types';
import { ProductGrid } from '../components/product';
import { useCart } from '../hooks/useCart';
import { ProductGridSkeleton } from '../components/ui/Skeleton';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const { addToCart } = useCart();

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug, sortBy]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);

    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (categoryData) {
      setCategory(categoryData);

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
        .eq('category_id', categoryData.id)
        .eq('is_active', true);

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

      const { data: productsData } = await query;

      if (productsData) {
        setProducts(productsData as ProductWithDetails[]);
      }
    }

    setLoading(false);
  };

  const handleAddToCart = async (product: ProductWithDetails) => {
    await addToCart(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <Link to="/products" className="text-gray-600 hover:text-gray-900 underline">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/products" className="hover:text-gray-900">
              Products
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{category.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              <p className="text-gray-600">{products.length} products</p>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {category.description && (
          <div className="bg-white rounded-lg p-6 mb-8">
            <p className="text-gray-700">{category.description}</p>
          </div>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}
