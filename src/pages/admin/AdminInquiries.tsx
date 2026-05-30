import { useState, useEffect } from 'react';
import { Search, Eye, MessageCircle, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

interface InquiryRow {
  id: string;
  user_id: string | null;
  product_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  message: string | null;
  quantity: number | null;
  size_id: string | null;
  color_id: string | null;
  inquiry_type: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
  product: {
    name: string;
    slug: string;
    images: { image_url: string; is_primary: boolean }[];
  } | null;
  size: { size_label: string } | null;
  color: { color_name: string } | null;
}

const STATUS_OPTIONS = ['new', 'in_progress', 'responded', 'closed'] as const;
type StatusFilter = 'all' | (typeof STATUS_OPTIONS)[number];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  responded: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  responded: 'Responded',
  closed: 'Closed',
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRow | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select(
        '*, product:products(name, slug, images:product_images(image_url, is_primary)), size:product_sizes(size_label), color:product_colors(color_name)'
      )
      .order('created_at', { ascending: false });

    if (data) setInquiries(data as unknown as InquiryRow[]);
    if (error) showToast('Failed to load inquiries', 'error');
    setLoading(false);
  };

  const filtered = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetail = (inquiry: InquiryRow) => {
    setSelectedInquiry(inquiry);
    setEditStatus(inquiry.status);
    setEditNotes(inquiry.admin_notes || '');
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedInquiry(null);
  };

  const handleSave = async () => {
    if (!selectedInquiry) return;
    setSaving(true);

    const { error } = await supabase
      .from('inquiries')
      .update({
        status: editStatus,
        admin_notes: editNotes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedInquiry.id);

    if (error) {
      showToast('Failed to update inquiry', 'error');
    } else {
      setInquiries(
        inquiries.map((inq) =>
          inq.id === selectedInquiry.id
            ? { ...inq, status: editStatus, admin_notes: editNotes.trim() || null }
            : inq
        )
      );
      showToast('Inquiry updated successfully', 'success');
      closeDetail();
    }
    setSaving(false);
  };

  const getWhatsAppLink = (inquiry: InquiryRow) => {
    const phone = inquiry.phone
      ? inquiry.phone.replace(/^\+/, '')
      : '9779763467975';
    const productName = inquiry.product?.name || 'your product';
    const message = `Hello ${inquiry.name}, thank you for your inquiry about ${productName}. `;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const getProductImage = (inquiry: InquiryRow) => {
    if (!inquiry.product?.images?.length) return null;
    const primary = inquiry.product.images.find((img) => img.is_primary);
    return primary?.image_url || inquiry.product.images[0]?.image_url || null;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-600">{inquiries.length} inquiries total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', ...STATUS_OPTIONS] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                statusFilter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : statusLabels[status]}
              {status !== 'all' && (
                <span className="ml-1.5 text-xs">
                  ({inquiries.filter((i) => i.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">Customer</th>
              <th className="hidden md:table-cell text-left py-4 px-6 font-medium text-gray-700">Email</th>
              <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">Product</th>
              <th className="hidden sm:table-cell text-left py-4 px-6 font-medium text-gray-700">Qty</th>
              <th className="hidden lg:table-cell text-left py-4 px-6 font-medium text-gray-700">Type</th>
              <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">Status</th>
              <th className="hidden md:table-cell text-left py-4 px-6 font-medium text-gray-700">Date</th>
              <th className="text-right py-4 px-4 sm:px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inquiry) => (
              <tr
                key={inquiry.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => openDetail(inquiry)}
              >
                <td className="py-4 px-4 sm:px-6">
                  <div className="font-medium text-gray-900">{inquiry.name}</div>
                  <div className="md:hidden flex flex-col gap-1 mt-1 text-xs text-gray-500">
                    <span>{inquiry.email}</span>
                    <span>{formatDate(inquiry.created_at)}</span>
                  </div>
                </td>
                <td className="hidden md:table-cell py-4 px-6 text-gray-600 text-sm">{inquiry.email}</td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="text-gray-900 text-sm">{inquiry.product?.name || '—'}</div>
                  <div className="sm:hidden flex flex-col gap-1 mt-1 text-xs text-gray-500">
                    <span>Qty: {inquiry.quantity ?? '—'}</span>
                    {inquiry.inquiry_type && (
                      <span className="inline-block px-1.5 py-0.5 font-medium rounded-full bg-purple-100 text-purple-700 w-fit">
                        {inquiry.inquiry_type}
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden sm:table-cell py-4 px-6 text-gray-600">{inquiry.quantity ?? '—'}</td>
                <td className="hidden lg:table-cell py-4 px-6">
                  {inquiry.inquiry_type && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {inquiry.inquiry_type}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span
                    className={`px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                      statusColors[inquiry.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusLabels[inquiry.status] || inquiry.status}
                  </span>
                </td>
                <td className="hidden md:table-cell py-4 px-6 text-gray-500 text-sm">
                  {formatDate(inquiry.created_at)}
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(inquiry);
                      }}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  No inquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={closeDetail}
        title="Inquiry Details"
        size="xl"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Product info */}
            {selectedInquiry.product && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {getProductImage(selectedInquiry) ? (
                    <img
                      src={getProductImage(selectedInquiry)!}
                      alt={selectedInquiry.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedInquiry.product.name}
                  </p>
                  {selectedInquiry.size && (
                    <p className="text-sm text-gray-500">
                      Size: {selectedInquiry.size.size_label}
                    </p>
                  )}
                  {selectedInquiry.color && (
                    <p className="text-sm text-gray-500">
                      Color: {selectedInquiry.color.color_name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                <p className="text-sm text-gray-900">{selectedInquiry.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                <p className="text-sm text-gray-900">{selectedInquiry.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                <p className="text-sm text-gray-900">{selectedInquiry.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Company</p>
                <p className="text-sm text-gray-900">
                  {selectedInquiry.company_name || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Quantity</p>
                <p className="text-sm text-gray-900">
                  {selectedInquiry.quantity ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Inquiry Type
                </p>
                <p className="text-sm text-gray-900">
                  {selectedInquiry.inquiry_type || '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Message</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedInquiry.message || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedInquiry.created_at)}
                </p>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Internal notes..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <a
                href={getWhatsAppLink(selectedInquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Reply on WhatsApp
              </a>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={closeDetail}>
                  Cancel
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
