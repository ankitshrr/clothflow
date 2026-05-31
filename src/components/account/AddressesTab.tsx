import { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useAddresses } from '../../hooks/useAddresses';
import Button from '../ui/Button';
import type { UserAddress } from '../../types';

export function AddressesTab() {
  const { addresses, loading, addAddress, updateAddress, deleteAddress } = useAddresses();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    is_default: false
  });

  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      phone: '',
      is_default: false
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (address: UserAddress) => {
    setFormData({
      title: address.title,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code || '',
      phone: address.phone || '',
      is_default: address.is_default
    });
    setEditingId(address.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (editingId) {
      await updateAddress(editingId, formData);
    } else {
      await addAddress(formData as any);
    }
    
    setSubmitting(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-8 animate-in fade-in duration-300">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button onClick={resetForm} className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Title (e.g., Home, Work)</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input required type="text" value={formData.address_line_1} onChange={e => setFormData({...formData, address_line_1: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input type="text" value={formData.address_line_2} onChange={e => setFormData({...formData, address_line_2: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input type="text" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div className="col-span-2 flex items-center mt-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={e => setFormData({...formData, is_default: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                Set as default address
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" loading={submitting}>
              {editingId ? 'Update Address' : 'Save Address'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your shipping addresses.</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No addresses saved</h3>
          <p className="text-gray-500 mb-4 mt-1">Add an address for a faster checkout experience.</p>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div key={address.id} className={`p-4 rounded-xl border-2 transition-all ${address.is_default ? 'border-primary bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{address.title}</h3>
                  {address.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-blue-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(address)} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAddress(address.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{address.address_line_1}</p>
                {address.address_line_2 && <p>{address.address_line_2}</p>}
                <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code}</p>
                <p>{address.country}</p>
                {address.phone && <p className="pt-2 flex items-center gap-1"><span className="text-gray-400">Phone:</span> {address.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
