import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProductWithDetails } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithDetails;
  inquiryType: 'order' | 'inquiry';
}

export default function InquiryModal({ isOpen, onClose, product, inquiryType }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    quantity: product.moq || 1,
    message: '',
    size_id: '',
    color_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('inquiries').insert({
        product_id: product.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company_name: formData.company_name || undefined,
        quantity: formData.quantity,
        message: formData.message || undefined,
        size_id: formData.size_id || null,
        color_id: formData.color_id || null,
        inquiry_type: inquiryType,
        status: 'new',
      });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company_name: '',
      quantity: product.moq || 1,
      message: '',
      size_id: '',
      color_id: '',
    });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={inquiryType === 'order' ? 'Request Order' : 'Send Inquiry'}
      size="lg"
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-green-400 opacity-30 animate-ping" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {inquiryType === 'order' ? 'Order Request Sent!' : 'Inquiry Submitted!'}
          </h3>
          <p className="text-gray-600 text-center max-w-sm mb-6">
            Thank you for your interest in <span className="font-semibold">{product.name}</span>. 
            Our team will review your {inquiryType === 'order' ? 'order request' : 'inquiry'} and get back to you within 24 hours.
          </p>
          <Button onClick={handleClose} variant="primary" size="lg">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Preview */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            {primaryImage && (
              <img
                src={primaryImage.image_url}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover shadow-sm"
              />
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-500">
                MOQ: {product.moq} pcs • {product.category?.name || 'Uncategorized'}
              </p>
            </div>
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inq-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="inq-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="inq-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="inq-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                placeholder="john@company.com"
              />
            </div>
          </div>

          {/* Phone & Company Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inq-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="inq-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                placeholder="+977 98XXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="inq-company" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                id="inq-company"
                name="company_name"
                type="text"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                placeholder="ABC Trading Co."
              />
            </div>
          </div>

          {/* Size & Color selectors */}
          {(product.sizes.length > 0 || product.colors.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.sizes.length > 0 && (
                <div>
                  <label htmlFor="inq-size" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Size
                  </label>
                  <select
                    id="inq-size"
                    name="size_id"
                    value={formData.size_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                  >
                    <option value="">Select size</option>
                    {product.sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.size_label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {product.colors.length > 0 && (
                <div>
                  <label htmlFor="inq-color" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Color
                  </label>
                  <select
                    id="inq-color"
                    name="color_id"
                    value={formData.color_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                  >
                    <option value="">Select color</option>
                    {product.colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.color_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label htmlFor="inq-qty" className="block text-sm font-medium text-gray-700 mb-1">
              Desired Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="inq-qty"
              name="quantity"
              type="number"
              required
              min={product.moq || 1}
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum order quantity: {product.moq} pcs
            </p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="inq-message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="inq-message"
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white resize-none"
              placeholder="Any special requirements, customization needs, or questions..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="flex-1">
              {inquiryType === 'order' ? 'Submit Order Request' : 'Send Inquiry'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
