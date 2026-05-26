import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProductWithDetails, Category } from '../../types';
import { formatPrice } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
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
        colors:product_colors (*)
      `
      )
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;
    if (data) setProducts(data as ProductWithDetails[]);

    setLoading(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (!error) {
      setProducts(products.filter((p) => p.id !== productId));
      showToast('Product deleted successfully', 'success');
    } else {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleToggleActive = async (product: ProductWithDetails) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);

    if (!error) {
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
      showToast(
        `Product ${!product.is_active ? 'activated' : 'deactivated'}`,
        'success'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">{products.length} products total</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-6 font-medium text-gray-700">Product</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Category</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Price</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-right py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {product.category?.name || '-'}
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(product.base_price)}
                    </p>
                    {product.sale_price && (
                      <p className="text-sm text-red-600">
                        Sale: {formatPrice(product.sale_price)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
