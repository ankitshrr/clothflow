import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { StoreLocation } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

export default function AdminStores() {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    offers_pickup: true,
    is_active: true,
    monday: '9:00 AM - 6:00 PM',
    tuesday: '9:00 AM - 6:00 PM',
    wednesday: '9:00 AM - 6:00 PM',
    thursday: '9:00 AM - 6:00 PM',
    friday: '9:00 AM - 9:00 PM',
    saturday: '10:00 AM - 8:00 PM',
    sunday: '11:00 AM - 6:00 PM',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('store_locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setStores(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const operatingHours = {
      monday: formData.monday,
      tuesday: formData.tuesday,
      wednesday: formData.wednesday,
      thursday: formData.thursday,
      friday: formData.friday,
      saturday: formData.saturday,
      sunday: formData.sunday,
    };

    const storeData = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postal_code,
      phone: formData.phone,
      email: formData.email,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      operating_hours: operatingHours,
      offers_pickup: formData.offers_pickup,
      is_active: formData.is_active,
    };

    if (editingStore) {
      const { error } = await supabase
        .from('store_locations')
        .update(storeData)
        .eq('id', editingStore.id);

      if (!error) {
        showToast('Store updated successfully', 'success');
        fetchStores();
        setShowModal(false);
        resetForm();
      } else {
        showToast('Failed to update store', 'error');
      }
    } else {
      const { error } = await supabase.from('store_locations').insert(storeData);

      if (!error) {
        showToast('Store added successfully', 'success');
        fetchStores();
        setShowModal(false);
        resetForm();
      } else {
        showToast('Failed to add store', 'error');
      }
    }
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;

    const { error } = await supabase
      .from('store_locations')
      .delete()
      .eq('id', storeId);

    if (!error) {
      setStores(stores.filter((s) => s.id !== storeId));
      showToast('Store deleted successfully', 'success');
    } else {
      showToast('Failed to delete store', 'error');
    }
  };

  const handleEdit = (store: StoreLocation) => {
    setEditingStore(store);
    const hours = store.operating_hours as Record<string, string>;
    setFormData({
      name: store.name,
      address: store.address,
      city: store.city,
      state: store.state || '',
      postal_code: store.postal_code || '',
      phone: store.phone || '',
      email: store.email || '',
      latitude: store.latitude.toString(),
      longitude: store.longitude.toString(),
      offers_pickup: store.offers_pickup,
      is_active: store.is_active,
      monday: hours?.monday || '9:00 AM - 6:00 PM',
      tuesday: hours?.tuesday || '9:00 AM - 6:00 PM',
      wednesday: hours?.wednesday || '9:00 AM - 6:00 PM',
      thursday: hours?.thursday || '9:00 AM - 6:00 PM',
      friday: hours?.friday || '9:00 AM - 9:00 PM',
      saturday: hours?.saturday || '10:00 AM - 8:00 PM',
      sunday: hours?.sunday || '11:00 AM - 6:00 PM',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
      offers_pickup: true,
      is_active: true,
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '10:00 AM - 8:00 PM',
      sunday: '11:00 AM - 6:00 PM',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Locations</h1>
          <p className="text-gray-600">{stores.length} stores total</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Store
        </Button>
      </div>

      <div className="grid gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        store.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {store.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {store.offers_pickup && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        Pickup Available
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        {store.address}, {store.city}, {store.state} {store.postal_code}
                      </span>
                    </div>
                    {store.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{store.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Coordinates: {store.latitude}, {store.longitude}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Clock className="w-4 h-4" />
                      Operating Hours
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(store.operating_hours as Record<string, string>).map(
                        ([day, hours]) => (
                          <div key={day} className="bg-gray-50 rounded px-2 py-1">
                            <span className="capitalize font-medium">{day}:</span>{' '}
                            <span className="text-gray-600">{hours}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 ml-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View on Map
                  </a>
                  <button
                    onClick={() => handleEdit(store)}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingStore ? 'Edit Store' : 'Add New Store'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="40.7505"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="-73.9934"
                required
              />
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-2">
                Find coordinates:{' '}
                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open Google Maps
                </a>
                , right-click on location, and copy coordinates
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Operating Hours</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {days.map((day) => (
                <div key={day}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {day}
                  </label>
                  <input
                    type="text"
                    value={formData[day as keyof typeof formData] as string}
                    onChange={(e) =>
                      setFormData({ ...formData, [day]: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.offers_pickup}
                onChange={(e) => setFormData({ ...formData, offers_pickup: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Offers Pickup</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">
              {editingStore ? 'Update Store' : 'Add Store'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
