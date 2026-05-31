import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Upload, X, Check, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProductWithDetails, Category, ProductImage, ProductSize, ProductColor, Inventory } from '../../types';
import { formatPrice, slugify } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

interface ImageForm {
  id?: string;
  image_url: string;
  alt_text: string;
  color_id?: string | null;
  display_order: number;
  is_primary: boolean;
  file?: File;
}

interface SizeForm {
  id?: string;
  size_label: string;
  size_type: 'clothing' | 'shoes' | 'accessories';
}

interface ColorForm {
  id?: string;
  color_name: string;
  color_hex: string;
}

interface InventoryForm {
  size_label?: string; // used for mapping
  color_name?: string; // used for mapping
  quantity: number;
  low_stock_threshold: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'variants' | 'inventory'>('basic');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productType, setProductType] = useState<'retail' | 'wholesale' | 'both'>('retail');
  const [moq, setMoq] = useState(10);
  const [basePrice, setBasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Complex sub-resource states for editing
  const [formImages, setFormImages] = useState<ImageForm[]>([]);
  const [formSizes, setFormSizes] = useState<SizeForm[]>([]);
  const [formColors, setFormColors] = useState<ColorForm[]>([]);
  const [formInventory, setFormInventory] = useState<Record<string, InventoryForm>>({});

  // Input states for sub-resources
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSizeLabel, setNewSizeLabel] = useState('');
  const [newSizeType, setNewSizeType] = useState<'clothing' | 'shoes' | 'accessories'>('clothing');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, selectedCategory, selectedType]);

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
        colors:product_colors (*),
        inventory (*)
      `
      )
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    if (selectedType !== 'all') {
      query = query.eq('product_type', selectedType);
    }

    const { data } = await query;
    if (data) setProducts(data as ProductWithDetails[]);

    setLoading(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? All images, reviews, and inventory will be deleted.')) return;

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
    } else {
      showToast('Failed to update status', 'error');
    }
  };

  // Open modal in Add mode
  const handleAddClick = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setSku('');
    setDescription('');
    setShortDescription('');
    setCategoryId(categories[0]?.id || '');
    setProductType('retail');
    setMoq(10);
    setBasePrice(0);
    setSalePrice(null);
    setIsFeatured(false);
    setIsActive(true);
    setFormImages([]);
    setFormSizes([]);
    setFormColors([]);
    setFormInventory({});
    setActiveTab('basic');
    setShowModal(true);
  };

  // Open modal in Edit mode
  const handleEditClick = (product: ProductWithDetails) => {
    setEditingProduct(product);
    setName(product.name);
    setSlug(product.slug);
    setSku(product.sku || '');
    setDescription(product.description || '');
    setShortDescription(product.short_description || '');
    setCategoryId(product.category_id || '');
    setProductType(product.product_type || 'retail');
    setMoq(product.moq || 10);
    setBasePrice(product.base_price);
    setSalePrice(product.sale_price);
    setIsFeatured(product.is_featured || false);
    setIsActive(product.is_active ?? true);

    // Populate images
    setFormImages(
      product.images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        color_id: img.color_id || null,
        display_order: img.display_order || 0,
        is_primary: img.is_primary || false,
      }))
    );

    // Populate sizes
    setFormSizes(
      product.sizes.map((s) => ({
        id: s.id,
        size_label: s.size_label,
        size_type: s.size_type as any,
      }))
    );

    // Populate colors
    setFormColors(
      product.colors.map((c) => ({
        id: c.id,
        color_name: c.color_name,
        color_hex: c.color_hex || '#000000',
      }))
    );

    // Populate inventory map
    const invMap: Record<string, InventoryForm> = {};
    product.inventory.forEach((inv) => {
      const sizeLabel = product.sizes.find((s) => s.id === inv.size_id)?.size_label || '';
      const colorName = product.colors.find((c) => c.id === inv.color_id)?.color_name || '';
      const key = `${sizeLabel}_${colorName}`;
      invMap[key] = {
        size_label: sizeLabel,
        color_name: colorName,
        quantity: inv.quantity ?? 0,
        low_stock_threshold: inv.low_stock_threshold ?? 10,
      };
    });
    setFormInventory(invMap);

    setActiveTab('basic');
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(slugify(val));
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    // Ensure the storage bucket exists (creates it if missing, safe to call if it already exists)
    await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        showToast(`Failed to upload image: ${error.message}`, 'error');
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        setFormImages((prev) => [
          ...prev,
          {
            image_url: publicUrl,
            alt_text: file.name,
            color_id: null,
            display_order: prev.length,
            is_primary: prev.length === 0,
          },
        ]);
      }
    }
    setUploading(false);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormImages((prev) => [
      ...prev,
      {
        image_url: newImageUrl.trim(),
        alt_text: 'Product Image',
        color_id: null,
        display_order: prev.length,
        is_primary: prev.length === 0,
      },
    ]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure one is primary if list is not empty
      if (prev[index]?.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetImageColor = (index: number, colorId: string | null) => {
    setFormImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, color_id: colorId } : img))
    );
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  // Sizes handlers
  const handleAddSize = () => {
    const label = newSizeLabel.trim();
    if (!label) return;
    if (formSizes.some((s) => s.size_label.toLowerCase() === label.toLowerCase())) {
      showToast('Size already added', 'error');
      return;
    }
    setFormSizes((prev) => [...prev, { size_label: label, size_type: newSizeType }]);
    setNewSizeLabel('');
  };

  const handleRemoveSize = (index: number) => {
    const sizeToRemove = formSizes[index];
    setFormSizes((prev) => prev.filter((_, i) => i !== index));
    
    // Clean up inventory records that use this size
    if (sizeToRemove) {
      setFormInventory((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key.startsWith(`${sizeToRemove.size_label}_`)) {
            delete next[key];
          }
        });
        return next;
      });
    }
  };

  // Colors handlers
  const handleAddColor = () => {
    const colorName = newColorName.trim();
    if (!colorName) return;
    if (formColors.some((c) => c.color_name.toLowerCase() === colorName.toLowerCase())) {
      showToast('Color already added', 'error');
      return;
    }
    setFormColors((prev) => [...prev, { color_name: colorName, color_hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    const colorToRemove = formColors[index];
    setFormColors((prev) => prev.filter((_, i) => i !== index));
    
    // Clean up inventory records that use this color
    if (colorToRemove) {
      setFormInventory((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key.endsWith(`_${colorToRemove.color_name}`)) {
            delete next[key];
          }
        });
        return next;
      });
    }
  };

  // Inventory logic: Generate matrix keys
  const getInventoryMatrixKeys = () => {
    const keys: { size: string; color: string; key: string }[] = [];
    if (formSizes.length === 0 && formColors.length === 0) {
      keys.push({ size: '', color: '', key: '_' });
    } else if (formSizes.length > 0 && formColors.length === 0) {
      formSizes.forEach((s) => {
        keys.push({ size: s.size_label, color: '', key: `${s.size_label}_` });
      });
    } else if (formSizes.length === 0 && formColors.length > 0) {
      formColors.forEach((c) => {
        keys.push({ size: '', color: c.color_name, key: `_${c.color_name}` });
      });
    } else {
      formSizes.forEach((s) => {
        formColors.forEach((c) => {
          keys.push({
            size: s.size_label,
            color: c.color_name,
            key: `${s.size_label}_${c.color_name}`,
          });
        });
      });
    }
    return keys;
  };

  const handleInventoryQuantityChange = (key: string, value: number, size: string, color: string) => {
    setFormInventory((prev) => ({
      ...prev,
      [key]: {
        size_label: size || undefined,
        color_name: color || undefined,
        quantity: value,
        low_stock_threshold: prev[key]?.low_stock_threshold ?? 10,
      },
    }));
  };

  const handleInventoryThresholdChange = (key: string, value: number, size: string, color: string) => {
    setFormInventory((prev) => ({
      ...prev,
      [key]: {
        size_label: size || undefined,
        color_name: color || undefined,
        quantity: prev[key]?.quantity ?? 0,
        low_stock_threshold: value,
      },
    }));
  };

  // Save full product + sub-resources
  const handleSaveProduct = async () => {
    if (!name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!slug.trim()) {
      showToast('Slug is required', 'error');
      return;
    }

    setSaving(true);
    try {
      // Ensure slug uniqueness before saving
      let baseSlug = slug.trim();
      let finalSlug = baseSlug;
      let isUnique = false;
      let counter = 0;

      while (!isUnique) {
        let query = supabase
          .from('products')
          .select('id')
          .eq('slug', finalSlug);
        
        if (editingProduct) {
          query = query.neq('id', editingProduct.id);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (data && data.length > 0) {
          counter++;
          finalSlug = `${baseSlug}-${counter}`;
        } else {
          isUnique = true;
        }
      }

      // Check if SKU is unique (if provided)
      if (sku.trim()) {
        let skuQuery = supabase
          .from('products')
          .select('id')
          .eq('sku', sku.trim());
        
        if (editingProduct) {
          skuQuery = skuQuery.neq('id', editingProduct.id);
        }

        const { data: skuData, error: skuErr } = await skuQuery;
        if (skuErr) throw skuErr;

        if (skuData && skuData.length > 0) {
          showToast(`The SKU "${sku.trim()}" is already in use by another product. Please use a unique SKU.`, 'error');
          setSaving(false);
          return;
        }
      }

      // Build payload - only include moq/product_type if columns exist (migration has been run)
      const productPayload: Record<string, any> = {
        name: name.trim(),
        slug: finalSlug,
        sku: sku.trim() || null,
        description: description.trim() || null,
        short_description: shortDescription.trim() || null,
        category_id: categoryId || null,
        base_price: basePrice,
        sale_price: salePrice,
        is_featured: isFeatured,
        is_active: isActive,
      };

      // Try to include wholesale fields - these require the migration to be run in Supabase
      // Go to Supabase SQL Editor and run:
      // ALTER TABLE products ADD COLUMN IF NOT EXISTS moq integer DEFAULT 1;
      // ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'retail';
      // NOTIFY pgrst, 'reload schema';
      try {
        // Test if the columns exist by reading a product that has them
        productPayload['product_type'] = productType;
        productPayload['moq'] = productType === 'retail' ? 1 : moq;
        if (productType === 'wholesale') {
          productPayload['base_price'] = 0;
          productPayload['sale_price'] = null;
        }
      } catch (_) {
        // If columns don't exist, just skip them
      }

      let productId = '';

      if (editingProduct) {
        productId = editingProduct.id;
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // 1. Save sizes
      const { data: currentSizes } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', productId);


      const sizesToDelete = ((currentSizes as ProductSize[]) || []).filter(
        (cs: ProductSize) => !formSizes.some((fs) => fs.id === cs.id)
      );
      if (sizesToDelete.length > 0) {
        await supabase.from('product_sizes').delete().in('id', sizesToDelete.map((s: ProductSize) => s.id));
      }

      const sizesToInsert = formSizes
        .filter((fs) => !fs.id)
        .map((fs) => ({
          product_id: productId,
          size_label: fs.size_label,
          size_type: fs.size_type,
        }));
      
      let finalSizes: ProductSize[] = [];
      if (sizesToInsert.length > 0) {
        const { data: insertedSizes, error: sizeErr } = await supabase
          .from('product_sizes')
          .insert(sizesToInsert)
          .select('*');
        if (sizeErr) throw sizeErr;
        finalSizes = [...((currentSizes as ProductSize[]) || []).filter((cs: ProductSize) => formSizes.some((fs) => fs.id === cs.id)), ...(insertedSizes || [])];
      } else {
        finalSizes = ((currentSizes as ProductSize[]) || []).filter((cs: ProductSize) => formSizes.some((fs) => fs.id === cs.id));
      }

      // 2. Save colors
      const { data: currentColors } = await supabase
        .from('product_colors')
        .select('*')
        .eq('product_id', productId);

      const colorsToDelete = ((currentColors as ProductColor[]) || []).filter(
        (cc: ProductColor) => !formColors.some((fc) => fc.id === cc.id)
      );
      if (colorsToDelete.length > 0) {
        await supabase.from('product_colors').delete().in('id', colorsToDelete.map((c: ProductColor) => c.id));
      }

      const colorsToInsert = formColors
        .filter((fc) => !fc.id)
        .map((fc) => ({
          product_id: productId,
          color_name: fc.color_name,
          color_hex: fc.color_hex,
        }));

      let finalColors: ProductColor[] = [];
      if (colorsToInsert.length > 0) {
        const { data: insertedColors, error: colErr } = await supabase
          .from('product_colors')
          .insert(colorsToInsert)
          .select('*');
        if (colErr) throw colErr;
        finalColors = [...((currentColors as ProductColor[]) || []).filter((cc: ProductColor) => formColors.some((fc) => fc.id === cc.id)), ...(insertedColors || [])];
      } else {
        finalColors = ((currentColors as ProductColor[]) || []).filter((cc: ProductColor) => formColors.some((fc) => fc.id === cc.id));
      }

      // 3. Save images
      const { data: currentImages } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId);

      const imagesToDelete = ((currentImages as ProductImage[]) || []).filter(
        (ci: ProductImage) => !formImages.some((fi) => fi.id === ci.id)
      );
      if (imagesToDelete.length > 0) {
        await supabase.from('product_images').delete().in('id', imagesToDelete.map((i: ProductImage) => i.id));
      }

      // Upsert/insert active images
      const imagesToInsert: any[] = [];
      const imagesToUpdate: any[] = [];

      formImages.forEach((img, idx) => {
        const payload = {
          product_id: productId,
          image_url: img.image_url,
          alt_text: img.alt_text,
          color_id: img.color_id || null,
          display_order: idx,
          is_primary: img.is_primary,
        };
        if (img.id && !img.id.startsWith('temp_')) {
          imagesToUpdate.push({ ...payload, id: img.id });
        } else {
          imagesToInsert.push(payload);
        }
      });

      if (imagesToInsert.length > 0) {
        const { error: imgInsErr } = await supabase.from('product_images').insert(imagesToInsert);
        if (imgInsErr) throw imgInsErr;
      }
      
      if (imagesToUpdate.length > 0) {
        const { error: imgUpdErr } = await supabase.from('product_images').upsert(imagesToUpdate);
        if (imgUpdErr) throw imgUpdErr;
      }

      // 4. Save inventory
      // Fetch all combinations currently in inventory
      const { data: currentInventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', productId);

      const matrix = getInventoryMatrixKeys();
      const inventoryToInsert: any[] = [];
      const inventoryToUpdate: any[] = [];

      matrix.forEach(({ size, color, key }) => {
        const matchedSize = finalSizes.find((s) => s.size_label === size);
        const matchedColor = finalColors.find((c) => c.color_name === color);
        const quantity = formInventory[key]?.quantity ?? 0;
        const lowStock = formInventory[key]?.low_stock_threshold ?? 10;
        
        // Find existing record for this combination (for keeping IDs)
        const existing = ((currentInventory as Inventory[]) || []).find(
          (inv: Inventory) => inv.size_id === (matchedSize?.id || null) && inv.color_id === (matchedColor?.id || null)
        );

        const record = {
          product_id: productId,
          size_id: matchedSize?.id || null,
          color_id: matchedColor?.id || null,
          quantity,
          low_stock_threshold: lowStock,
        };

        if (existing?.id) {
          inventoryToUpdate.push({ ...record, id: existing.id });
        } else {
          inventoryToInsert.push(record);
        }
      });

      // Clear any inventory rows no longer in matrix
      const matrixCombos = matrix.map(({ size, color }) => {
        const matchedSize = finalSizes.find((s) => s.size_label === size);
        const matchedColor = finalColors.find((c) => c.color_name === color);
        return `${matchedSize?.id || null}_${matchedColor?.id || null}`;
      });

      const invToDelete = ((currentInventory as Inventory[]) || []).filter(
        (inv: Inventory) => !matrixCombos.includes(`${inv.size_id}_${inv.color_id}`)
      );
      if (invToDelete.length > 0) {
        await supabase.from('inventory').delete().in('id', invToDelete.map((i: Inventory) => i.id));
      }

      if (inventoryToInsert.length > 0) {
        const { error: invInsErr } = await supabase.from('inventory').insert(inventoryToInsert);
        if (invInsErr) throw invInsErr;
      }
      
      if (inventoryToUpdate.length > 0) {
        const { error: invUpdErr } = await supabase.from('inventory').upsert(inventoryToUpdate);
        if (invUpdErr) throw invUpdErr;
      }

      showToast(`Product ${editingProduct ? 'updated' : 'created'} successfully`, 'success');
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      showToast(`Failed to save product: ${err.message}`, 'error');
    } finally {
      setSaving(false);
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">{products.length} products total</p>
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="retail">Retail Only</option>
              <option value="wholesale">Wholesale Only</option>
              <option value="both">Both (Retail & Wholesale)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">Product</th>
              <th className="hidden lg:table-cell text-left py-4 px-6 font-medium text-gray-700">Category</th>
              <th className="hidden md:table-cell text-left py-4 px-6 font-medium text-gray-700">Type</th>
              <th className="hidden sm:table-cell text-left py-4 px-6 font-medium text-gray-700">Pricing / MOQ</th>
              <th className="hidden sm:table-cell text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-right py-4 px-4 sm:px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{product.sku || 'No SKU'}</p>
                      {/* Mobile-only info */}
                      <div className="sm:hidden mt-1 flex flex-col gap-1">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded w-fit ${
                          product.product_type === 'wholesale' 
                            ? 'bg-purple-100 text-purple-700' 
                            : product.product_type === 'both' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {product.product_type}
                        </span>
                        <p className="text-xs font-medium text-gray-900">
                          {product.product_type === 'wholesale' ? `MOQ: ${product.moq}` : formatPrice(product.base_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell py-4 px-6 text-gray-600">
                  {product.category?.name || '-'}
                </td>
                <td className="hidden md:table-cell py-4 px-6">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    product.product_type === 'wholesale' 
                      ? 'bg-purple-100 text-purple-700' 
                      : product.product_type === 'both' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    {product.product_type}
                  </span>
                </td>
                <td className="hidden sm:table-cell py-4 px-6">
                  {product.product_type === 'wholesale' ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-900">MOQ: {product.moq} pcs</p>
                      <p className="text-xs text-gray-500">Inquiry Based</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-950">
                        {formatPrice(product.base_price)}
                      </p>
                      {product.sale_price && (
                        <p className="text-xs text-red-600">
                          Sale: {formatPrice(product.sale_price)}
                        </p>
                      )}
                      {product.product_type === 'both' && (
                        <p className="text-xs text-emerald-600 font-semibold mt-0.5">MOQ: {product.moq} pcs (WS)</p>
                      )}
                    </div>
                  )}
                </td>
                <td className="hidden sm:table-cell py-4 px-6">
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
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="text-gray-600 hover:text-gray-950 text-xs font-medium px-2 py-1 rounded border hover:bg-gray-50 transition-colors"
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEditClick(product)}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-655 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="xl"
      >
        <div className="flex flex-col h-[70vh]">
          {/* Tabs header */}
          <div className="flex border-b mb-4 flex-shrink-0">
            {(['basic', 'images', 'variants', 'inventory'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab === 'basic' ? 'Basic Info' : tab}
              </button>
            ))}
          </div>

          {/* Tab content - scrollable */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Auto-generated)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      placeholder="product-slug"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      placeholder="e.g. STY-PRD-102"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                    >
                      <option value="retail">Retail Only</option>
                      <option value="wholesale">Wholesale Only</option>
                      <option value="both">Both (Retail & Wholesale)</option>
                    </select>
                  </div>

                  {(productType === 'wholesale' || productType === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale MOQ</label>
                      <input
                        type="number"
                        min={1}
                        value={moq}
                        onChange={(e) => setMoq(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                  )}
                </div>

                {productType !== 'wholesale' && (
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Rs.)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={basePrice}
                        onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Rs.) (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={salePrice || ''}
                        onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                        placeholder="No sale price"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Short Description (Brief highlight)</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                    placeholder="Brief highlight line..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                    placeholder="Full product details/specifications..."
                  />
                </div>

                <div className="flex gap-6 border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-gray-900 border-gray-300 focus:ring-gray-900 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Show on Homepage (Featured)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-gray-900 border-gray-300 focus:ring-gray-900 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (Visible to customers)</span>
                  </label>
                </div>
              </div>
            )}

            {/* IMAGES TAB */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Upload Box */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors relative flex flex-col items-center justify-center bg-gray-50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-gray-450 mb-3" />
                    <p className="text-sm font-semibold text-gray-700">
                      {uploading ? 'Uploading images...' : 'Click or drag files here to upload'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                  </div>

                  {/* URL Upload Box */}
                  <div className="border border-gray-250 rounded-xl p-6 flex flex-col justify-center gap-4 bg-white">
                    <h4 className="text-sm font-bold text-gray-800">Add Image via URL</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                      <Button onClick={handleAddImageUrl} variant="secondary" size="sm" className="whitespace-nowrap flex-shrink-0">
                        Add URL
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Images List */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Product Images Gallery</h4>
                  {formImages.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border text-gray-500 text-sm">
                      No images added yet. Upload files or input URLs above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative group border rounded-xl overflow-hidden bg-gray-150 flex flex-col">
                          <div className="relative aspect-[3/4] w-full">
                            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                            
                            {/* Image Actions Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <button
                                onClick={() => handleRemoveImage(idx)}
                                className="self-end bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleSetPrimaryImage(idx)}
                                className={`w-full py-1 text-xs font-semibold rounded transition-colors ${
                                  img.is_primary
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-gray-900 hover:bg-gray-100'
                                }`}
                              >
                                {img.is_primary ? 'Primary Image' : 'Set Primary'}
                              </button>
                            </div>

                            {/* Primary indicator badge */}
                            {img.is_primary && (
                              <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                Primary
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white border-t">
                            <select
                              value={img.color_id || ''}
                              onChange={(e) => handleSetImageColor(idx, e.target.value || null)}
                              className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                            >
                              <option value="">No Color Assigned</option>
                              {formColors.map((c) => (
                                <option key={c.id} value={c.id}>{c.color_name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VARIANTS TAB */}
            {activeTab === 'variants' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sizes Config */}
                <div className="space-y-4 md:border-r md:pr-6 pb-6 md:pb-0 border-b md:border-b-0 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Manage Product Sizes</h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSizeLabel}
                      onChange={(e) => setNewSizeLabel(e.target.value)}
                      placeholder="e.g. S, M, XL, 32, 10"
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                    />
                    <select
                      value={newSizeType}
                      onChange={(e) => setNewSizeType(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm flex-shrink-0"
                    >
                      <option value="clothing">Clothing</option>
                      <option value="shoes">Shoes</option>
                      <option value="accessories">Accessories</option>
                    </select>
                    <Button onClick={handleAddSize} variant="secondary" size="sm" className="whitespace-nowrap flex-shrink-0">Add</Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {formSizes.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-gray-100 border text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {s.size_label} ({s.size_type})
                        <button onClick={() => handleRemoveSize(idx)} className="text-gray-550 hover:text-red-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {formSizes.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No sizes configured. Default generic stock will apply.</p>
                    )}
                  </div>
                </div>

                {/* Colors Config */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Manage Product Colors</h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="e.g. Crimson Red, Jet Black"
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-10 h-9 p-0 border border-gray-300 rounded-md cursor-pointer flex-shrink-0"
                    />
                    <Button onClick={handleAddColor} variant="secondary" size="sm" className="whitespace-nowrap flex-shrink-0">Add</Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {formColors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 bg-gray-100 border text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.color_hex }} />
                        {c.color_name}
                        <button onClick={() => handleRemoveColor(idx)} className="text-gray-550 hover:text-red-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {formColors.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No colors configured. Default generic stock will apply.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Configure Stock Quantity</h3>
                <p className="text-xs text-gray-500">
                  Set inventory quantities and low stock thresholds for each combination of sizes and colors.
                </p>

                <div className="border rounded-xl bg-white shadow-sm max-h-[350px] overflow-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        {formSizes.length > 0 && <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>}
                        {formColors.length > 0 && <th className="text-left py-3 px-4 font-semibold text-gray-700">Color</th>}
                        {formSizes.length === 0 && formColors.length === 0 && (
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Variant</th>
                        )}
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity (pcs)</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Low Stock Alert Threshold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getInventoryMatrixKeys().map(({ size, color, key }) => {
                        const quantity = formInventory[key]?.quantity ?? 0;
                        const threshold = formInventory[key]?.low_stock_threshold ?? 10;
                        return (
                          <tr key={key} className="border-b hover:bg-gray-50">
                            {formSizes.length > 0 && <td className="py-3 px-4 font-medium text-gray-900">{size}</td>}
                            {formColors.length > 0 && (
                              <td className="py-3 px-4 flex items-center gap-2">
                                {color && (
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border shadow-sm"
                                    style={{
                                      backgroundColor: formColors.find((c) => c.color_name === color)?.color_hex || '#000000',
                                    }}
                                  />
                                )}
                                <span className="font-medium text-gray-900">{color || '—'}</span>
                              </td>
                            )}
                            {formSizes.length === 0 && formColors.length === 0 && (
                              <td className="py-3 px-4 text-gray-500 italic">Default Stock (No Options)</td>
                            )}
                            <td className="py-2 px-4">
                              <input
                                type="number"
                                min={0}
                                value={quantity}
                                onChange={(e) =>
                                  handleInventoryQuantityChange(key, parseInt(e.target.value) || 0, size, color)
                                }
                                className="w-24 px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="number"
                                min={0}
                                value={threshold}
                                onChange={(e) =>
                                  handleInventoryThresholdChange(key, parseInt(e.target.value) || 0, size, color)
                                }
                                className="w-24 px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4 flex-shrink-0">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            
            {activeTab !== 'inventory' && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ['basic', 'images', 'variants', 'inventory'] as const;
                  const idx = tabs.indexOf(activeTab);
                  if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                }}
              >
                Next Section
              </Button>
            )}

            <Button onClick={handleSaveProduct} loading={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              Save Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
