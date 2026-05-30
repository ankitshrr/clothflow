import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FolderTree } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';
import { slugify } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
}

const defaultForm: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  parent_id: null,
  display_order: 0,
  is_active: true,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(defaultForm);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setCategories(data);
    if (error) showToast('Failed to load categories', 'error');
    setLoading(false);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getParentName = (parentId: string | null) => {
    if (!parentId) return '—';
    const parent = categories.find((c) => c.id === parentId);
    return parent?.name || '—';
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || null,
      display_order: category.display_order || 0,
      is_active: category.is_active ?? true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setForm(defaultForm);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slugify(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!form.slug.trim()) {
      showToast('Slug is required', 'error');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      parent_id: form.parent_id || null,
      display_order: form.display_order,
      is_active: form.is_active,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editingCategory.id);

      if (error) {
        showToast('Failed to update category', 'error');
      } else {
        showToast('Category updated successfully', 'success');
        closeModal();
        fetchCategories();
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);

      if (error) {
        showToast('Failed to create category', 'error');
      } else {
        showToast('Category created successfully', 'success');
        closeModal();
        fetchCategories();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      showToast('Failed to delete category', 'error');
    } else {
      setCategories(categories.filter((c) => c.id !== id));
      showToast('Category deleted successfully', 'success');
    }
  };

  const handleToggleActive = async (category: Category) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id);

    if (error) {
      showToast('Failed to update status', 'error');
    } else {
      setCategories(
        categories.map((c) =>
          c.id === category.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      showToast(
        `Category ${!category.is_active ? 'activated' : 'deactivated'}`,
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
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">{categories.length} categories total</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-6 font-medium text-gray-700">Image</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Name</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Slug</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Parent</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Order</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-right py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderTree className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="py-4 px-6 text-gray-500 text-sm">
                  {category.slug}
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {getParentName(category.parent_id)}
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {category.display_order ?? 0}
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleToggleActive(category)}
                    className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${
                      category.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="category-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Category description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <select
              value={form.parent_id || ''}
              onChange={(e) =>
                setForm({ ...form, parent_id: e.target.value || null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">None</option>
              {categories
                .filter((c) => c.id !== editingCategory?.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) =>
                setForm({ ...form, display_order: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
