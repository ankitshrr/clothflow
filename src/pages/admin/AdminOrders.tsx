import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { OrderWithItems } from '../../types';
import { formatPrice, formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

interface OrderWithUserDetails extends OrderWithItems {
  user_email?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithUserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithUserDetails | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);

    let query = supabase
      .from('orders')
      .select(
        `
        *,
        items:order_items (*)
      `
      )
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.ilike('order_number', `%${searchTerm}%`);
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    if (data) setOrders(data as OrderWithUserDetails[]);

    setLoading(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      showToast('Order status updated', 'success');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">{orders.length} orders total</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-6 font-medium text-gray-700">Order</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Date</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Items</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Total</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Payment</th>
              <th className="text-right py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">{order.order_number}</p>
                </td>
                <td className="py-4 px-6 text-gray-600">{formatDate(order.created_at)}</td>
                <td className="py-4 px-6 text-gray-600">{order.items?.length || 0} items</td>
                <td className="py-4 px-6 font-medium text-gray-900">
                  {formatPrice(order.total)}
                </td>
                <td className="py-4 px-6">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shipping_address as any}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Billing Address</h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.billing_address as any}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.size_label && `Size: ${item.size_label}`}
                        {item.color_name && ` | Color: ${item.color_name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.total_price)}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {formatPrice(selectedOrder.shipping_cost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(selectedOrder.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
