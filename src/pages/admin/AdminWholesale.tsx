import { useState, useEffect } from 'react';
import { Search, Eye, MessageCircle, Package, Truck, FileText, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  message: string | null;
  quantity: number | null;
  inquiry_type: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  product: {
    name: string;
    slug: string;
    moq: number;
    images: { image_url: string; is_primary: boolean }[];
  } | null;
  size: { size_label: string } | null;
  color: { color_name: string } | null;
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  order_items: {
    quantity: number;
    product_name: string;
  }[];
}

const STATUS_OPTIONS = ['new', 'in_progress', 'responded', 'closed'] as const;

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

export default function AdminWholesale() {
  const [activeTab, setActiveTab] = useState<'bulk_inquiries' | 'quotes_received' | 'reorder_history' | 'wholesale_catalog'>('wholesale_catalog');
  
  const [bulkInquiries, setBulkInquiries] = useState<InquiryRow[]>([]);
  const [quotesReceived, setQuotesReceived] = useState<InquiryRow[]>([]);
  const [reorderHistory, setReorderHistory] = useState<OrderRow[]>([]);
  const [wholesaleProducts, setWholesaleProducts] = useState<any[]>([]);
  const [wholesaleProductsCount, setWholesaleProductsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRow | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch inquiries
    const { data: inquiriesData } = await supabase
      .from('inquiries')
      .select('*, product:products(name, slug, moq, images:product_images(image_url, is_primary)), size:product_sizes(size_label), color:product_colors(color_name)')
      .order('created_at', { ascending: false });

    // Fetch wholesale products count
    const { data: productsData, count: prodCount } = await supabase
      .from('products')
      .select('id, name, sku, moq, is_active, images:product_images(image_url, is_primary)', { count: 'exact' })
      .in('product_type', ['wholesale', 'both']);

    // Fetch orders (Reorder history) - Just fetching all for simplicity, can be filtered to wholesale clients
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, created_at, user_id,
        profiles:user_id(full_name, email),
        order_items(quantity, product_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (inquiriesData) {
      const inqs = inquiriesData as unknown as InquiryRow[];
      setBulkInquiries(inqs.filter(i => i.inquiry_type === 'inquiry'));
      setQuotesReceived(inqs.filter(i => i.inquiry_type === 'order'));
    }

    if (ordersData) {
      setReorderHistory(ordersData as unknown as OrderRow[]);
    }

    if (productsData) {
      setWholesaleProducts(productsData);
    }
    setWholesaleProductsCount(prodCount || 0);
    setLoading(false);
  };

  const getFilteredInquiries = (list: InquiryRow[]) => {
    return list.filter((inq) => {
      const matchesSearch =
        inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredOrders = () => {
    return reorderHistory.filter((order) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(searchStr) ||
        (order.profiles?.full_name || '').toLowerCase().includes(searchStr) ||
        (order.profiles?.email || '').toLowerCase().includes(searchStr)
      );
    });
  };

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
      const updateList = (list: InquiryRow[]) =>
        list.map((inq) =>
          inq.id === selectedInquiry.id
            ? { ...inq, status: editStatus, admin_notes: editNotes.trim() || null }
            : inq
        );

      if (selectedInquiry.inquiry_type === 'inquiry') {
        setBulkInquiries(updateList(bulkInquiries));
      } else {
        setQuotesReceived(updateList(quotesReceived));
      }
      showToast('Updated successfully', 'success');
      closeDetail();
    }
    setSaving(false);
  };

  const getWhatsAppLink = (inquiry: InquiryRow) => {
    const phone = inquiry.phone ? inquiry.phone.replace(/^\+/, '') : '';
    if (!phone) return '';
    const productName = inquiry.product?.name || 'our products';
    const message = `Hello ${inquiry.name}, thank you for your wholesale request regarding ${productName}. `;
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

  const renderInquiryTable = (list: InquiryRow[]) => {
    const filtered = getFilteredInquiries(list);
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-4 px-6 font-medium text-gray-700">Client</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Product Details</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Req. Qty</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Date</th>
              <th className="text-right py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inq) => (
              <tr key={inq.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(inq)}>
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900">{inq.name}</div>
                  <div className="text-sm text-gray-500">{inq.company_name || 'No Company'}</div>
                  <div className="text-sm text-gray-500">{inq.email}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900 line-clamp-1 max-w-[250px]">
                    {inq.product?.name || '—'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {inq.size && <span>Size: {inq.size.size_label} </span>}
                    {inq.color && <span>Color: {inq.color.color_name}</span>}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium text-gray-900">{inq.quantity ?? '—'}</span>
                  {inq.product?.moq && (
                    <div className="text-xs text-gray-500 mt-1">MOQ: {inq.product.moq}</div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[inq.status] || 'bg-gray-100'}`}>
                    {statusLabels[inq.status] || inq.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {formatDate(inq.created_at)}
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={(e) => { e.stopPropagation(); openDetail(inq); }} className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100">
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOrderTable = () => {
    const filtered = getFilteredOrders();
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-4 px-6 font-medium text-gray-700">Order ID</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Client</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Items Summary</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
              const summary = order.order_items.map(i => `${i.quantity}x ${i.product_name}`).join(', ');
              
              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">{order.order_number}</td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{order.profiles?.full_name || '—'}</div>
                    <div className="text-sm text-gray-500">{order.profiles?.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900 line-clamp-2 max-w-sm text-sm">{summary}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Pieces: {totalItems}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wholesale Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage bulk inquiries, quote requests, and track wholesale reorders.</p>
      </div>

      {/* Stats Cards - Note: No prices are shown here */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Quotes Received</p>
              <p className="text-2xl font-bold text-gray-900">{quotesReceived.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MessageCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bulk Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{bulkInquiries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Truck className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reorder History</p>
              <p className="text-2xl font-bold text-gray-900">{reorderHistory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Package className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Wholesale Products</p>
              <p className="text-2xl font-bold text-gray-900">{wholesaleProductsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('quotes_received')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'quotes_received'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Quotes Received
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bulk_inquiries')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'bulk_inquiries'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Bulk Inquiries
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reorder_history')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reorder_history'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Reorder History
            </div>
          </button>
          <button
            onClick={() => setActiveTab('wholesale_catalog')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'wholesale_catalog'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" /> Wholesale Catalog
            </div>
          </button>
        </nav>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients or orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        
        {activeTab !== 'reorder_history' && activeTab !== 'wholesale_catalog' && (
          <div className="flex gap-2">
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
              </button>
            ))}
          </div>
        )}
        
        {activeTab === 'wholesale_catalog' && (
          <Button
            onClick={() => {
              window.location.href = '/admin/products?action=add_wholesale';
            }}
          >
            Add Wholesale Product
          </Button>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'quotes_received' && renderInquiryTable(quotesReceived)}
      {activeTab === 'bulk_inquiries' && renderInquiryTable(bulkInquiries)}
      {activeTab === 'reorder_history' && renderOrderTable()}
      {activeTab === 'wholesale_catalog' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-4 px-6 font-medium text-gray-700">Product</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">SKU</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">MOQ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                <th className="text-right py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wholesaleProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url;
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                          {primaryImage ? (
                            <img src={primaryImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{product.sku || '—'}</td>
                    <td className="py-4 px-6 font-medium">{product.moq} pcs</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/admin/products?edit=${product.id}`;
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {wholesaleProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No wholesale products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={closeDetail} title="Wholesale Request Details" size="xl">
        {selectedInquiry && (
          <div className="space-y-6">
            {selectedInquiry.product && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {getProductImage(selectedInquiry) ? (
                    <img src={getProductImage(selectedInquiry)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400 m-auto mt-6" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedInquiry.product.name}</p>
                  <div className="text-sm text-gray-500">
                    {selectedInquiry.size && <span className="mr-3">Size: {selectedInquiry.size.size_label}</span>}
                    {selectedInquiry.color && <span>Color: {selectedInquiry.color.color_name}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Product MOQ: {selectedInquiry.product.moq} pcs</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium text-gray-500 uppercase">Name</p><p className="text-sm font-medium">{selectedInquiry.name}</p></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Company</p><p className="text-sm font-medium">{selectedInquiry.company_name || '—'}</p></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Email</p><p className="text-sm">{selectedInquiry.email}</p></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Phone</p><p className="text-sm">{selectedInquiry.phone || '—'}</p></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Requested Qty</p><p className="text-sm font-bold text-gray-900">{selectedInquiry.quantity ?? '—'}</p></div>
              <div><p className="text-xs font-medium text-gray-500 uppercase">Date</p><p className="text-sm">{formatDate(selectedInquiry.created_at)}</p></div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Message / Requirements</p>
                <div className="text-sm bg-gray-50 p-3 rounded-md border mt-1 whitespace-pre-wrap">{selectedInquiry.message || 'No message provided.'}</div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Admin Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                  placeholder="Notes hidden from client..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              {getWhatsAppLink(selectedInquiry) ? (
                <a
                  href={getWhatsAppLink(selectedInquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Client
                </a>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={closeDetail}>Cancel</Button>
                <Button onClick={handleSave} loading={saving}>Save Updates</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
