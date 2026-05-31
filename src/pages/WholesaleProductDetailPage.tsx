import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MessageCircle, Info, ChevronRight, Check, ArrowLeft, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithDetails } from '../types';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import InquiryModal from '../components/product/InquiryModal';

export default function WholesaleProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [stock, setStock] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<'order' | 'inquiry'>('inquiry');

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      // Calculate total stock initially
      const total = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      setStock(total);

      // Select default color if available
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].id);
      }
      // Select default size if available
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0].id);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product && (selectedSize || selectedColor)) {
      updateStockForSelection();
    }
  }, [selectedSize, selectedColor]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories (*),
        images:product_images (*),
        sizes:product_sizes (*),
        colors:product_colors (*),
        inventory (*)
      `)
      .eq('slug', slug || '')
      .eq('is_active', true)
      .maybeSingle();


    if (data) {
      const prod = data as ProductWithDetails;
      setProduct(prod);
      const primary = prod.images.find((img) => img.is_primary) || prod.images[0];
      if (primary) {
        setActiveImage(primary.image_url);
      }
    }
    setLoading(false);
  };

  const updateStockForSelection = () => {
    if (!product) return;

    // If both are selected, filter specific
    if (selectedSize && selectedColor) {
      const match = product.inventory.find(
        (inv) => inv.size_id === selectedSize && inv.color_id === selectedColor
      );
      setStock(match ? match.quantity : 0);
    } else if (selectedSize) {
      const totalForSize = product.inventory
        .filter((inv) => inv.size_id === selectedSize)
        .reduce((sum, inv) => sum + inv.quantity, 0);
      setStock(totalForSize);
    } else if (selectedColor) {
      const totalForColor = product.inventory
        .filter((inv) => inv.color_id === selectedColor)
        .reduce((sum, inv) => sum + inv.quantity, 0);
      setStock(totalForColor);
    }
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    if (product) {
      const matchingImage = product.images.find((img) => img.color_id === colorId);
      if (matchingImage) {
        setActiveImage(matchingImage.image_url);
      }
    }
  };

  const openInquiryModal = (type: 'order' | 'inquiry') => {
    setInquiryType(type);
    setModalOpen(true);
  };

  const getWhatsAppLink = () => {
    if (!product) return '';
    const phone = '99763467975';
    const message = `Hello, I'm interested in wholesale order for "${product.name}" (Slug: ${product.slug}). Could you please share bulk pricing details? Thanks!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The product you are looking for does not exist or has been deactivated.</p>
          <Link to="/wholesale">
            <Button variant="primary">Back to Wholesale</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stockBadgeColor = () => {
    if (stock <= 0) return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400';
    if (stock < 20) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
  };

  const stockStatusLabel = () => {
    if (stock <= 0) return 'Out of Stock';
    if (stock < 20) return `Low Stock (${stock} pcs left)`;
    return 'In Stock & Ready to Ship';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/wholesale" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Wholesale
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 dark:text-gray-200 line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left: Images Column */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 relative">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
                {/* Float MOQ tag */}
                <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Package className="w-4 h-4 text-emerald-400" />
                  MOQ: {product.moq} pcs
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.image_url)}
                      className={`w-20 h-24 rounded-lg overflow-hidden border-2 bg-gray-50 flex-shrink-0 transition-all ${
                        activeImage === img.image_url
                          ? 'border-emerald-500 scale-95 shadow-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info Column */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  {/* Category Badge */}
                  {product.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 mb-3">
                      <Layers className="w-3 h-3" />
                      {product.category.name}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">SKU: {product.sku || 'N/A'}</p>
                </div>

                {/* MOQ Info Box */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Wholesale Minimum Order</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      This item requires a minimum purchase of <span className="font-bold text-emerald-700 dark:text-emerald-400">{product.moq} pieces</span>.
                    </p>
                  </div>
                </div>

                {/* Stock status indicator */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${stockBadgeColor()}`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {stockStatusLabel()}
                  </span>
                </div>

                {product.short_description && (
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                    {product.short_description}
                  </p>
                )}

                {/* Size Selector */}
                {product.sizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white">Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size.id)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                            selectedSize === size.id
                              ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                          }`}
                        >
                          {size.size_label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white">Available Colors</label>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => handleColorSelect(color.id)}
                          className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color.id
                              ? 'border-emerald-500 scale-110 shadow-md'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          title={color.color_name}
                        >
                          <span
                            className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner"
                            style={{ backgroundColor: color.color_hex }}
                          />
                          {selectedColor === color.id && (
                            <Check className="absolute w-3.5 h-3.5 text-white mix-blend-difference" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Section */}
              <div className="space-y-3 pt-6 border-t border-gray-150 dark:border-gray-750">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Request Order */}
                  <button
                    onClick={() => openInquiryModal('order')}
                    className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent rounded-xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm shadow-emerald-100 dark:shadow-none transition-colors"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Request Order
                  </button>

                  {/* WhatsApp */}
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent rounded-xl text-base font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm shadow-emerald-50/50 dark:shadow-none transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact on WhatsApp
                  </a>
                </div>

                {/* Send Inquiry */}
                <button
                  onClick={() => openInquiryModal('inquiry')}
                  className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl text-base font-semibold text-gray-750 dark:text-gray-250 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            </div>

          </div>

          {/* Full Description & Specs */}
          {product.description && (
            <div className="mt-12 pt-8 border-t border-gray-150 dark:border-gray-750">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Product Specifications</h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Modal */}
      {product && (
        <InquiryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={product}
          inquiryType={inquiryType}
        />
      )}
    </div>
  );
}
