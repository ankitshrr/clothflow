import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Wallet, ArrowRight, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice, formatDate } from '../../lib/utils';
import Loading from '../../components/ui/Loading';


interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalInquiries: number;
  newInquiries: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
}

interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  status: string;
  created_at: string;
  product: {
    name: string;
  } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    const [productsRes, ordersRes, profilesRes, inventoryRes, inquiriesRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('orders').select('id, total, status'),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('inventory').select('quantity'),
      supabase.from('inquiries').select('id, status, inquiry_type'),
    ]);

    const totalRevenue =
      ordersRes.data?.reduce((sum: number, order: any) => {
        if (order.status === 'delivered' || order.status === 'shipped') {
          return sum + (order.total || 0);
        }
        return sum;
      }, 0) || 0;

    const pendingOrders = ordersRes.data?.filter((o: any) => o.status === 'pending').length || 0;
    const totalInquiries = inquiriesRes.data?.length || 0;
    const newInquiries = inquiriesRes.data?.filter((i: any) => i.status === 'new').length || 0;

    setStats({
      totalProducts: productsRes.count || 0,
      totalOrders: ordersRes.data?.length || 0,
      totalCustomers: profilesRes.count || 0,
      totalRevenue,
      pendingOrders,
      lowStockProducts: inventoryRes.data?.filter((i: any) => i.quantity < 10).length || 0,
      totalInquiries,
      newInquiries,
    });

    const [recentOrdersRes, recentInquiriesRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_number, created_at, total, status')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('inquiries')
        .select('id, name, email, inquiry_type, status, created_at, product:products(name)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (recentOrdersRes.data) {
      setRecentOrders(recentOrdersRes.data);
    }
    if (recentInquiriesRes.data) {
      setRecentInquiries(recentInquiriesRes.data as unknown as RecentInquiry[]);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400',
    },
    {
      title: 'Wholesale Inquiries',
      value: stats.totalInquiries,
      icon: HelpCircle,
      href: '/admin/inquiries',
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: Wallet,
      href: '/admin/orders',
      color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400',
    },
  ];

  const alertCards = [
    {
      title: 'Pending Retail Orders',
      value: stats.pendingOrders,
      href: '/admin/orders?status=pending',
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400',
    },
    {
      title: 'New Wholesale Inquiries',
      value: stats.newInquiries,
      href: '/admin/inquiries?status=new',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
    },
    {
      title: 'Low Stock Products',
      value: stats.lowStockProducts,
      href: '/admin/products', // Since it's list of products
      color: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.href}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {alertCards.map((alert) => (
          <Link
            key={alert.title}
            to={alert.href}
            className={`rounded-lg p-6 border ${alert.color} hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{alert.value}</h3>
                <p className="text-sm opacity-90">{alert.title}</p>
              </div>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm text-gray-650 hover:text-gray-900 flex items-center gap-1 font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Order</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-gray-900 font-medium hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Inquiries</h2>
            <Link
              to="/admin/inquiries"
              className="text-sm text-gray-650 hover:text-gray-900 flex items-center gap-1 font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-705">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq) => (
                  <tr key={inq.id} className="border-b hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{inq.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm truncate max-w-[120px]">
                      {inq.product?.name || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-50 text-purple-700">
                        {inq.inquiry_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          inq.status === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : inq.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : inq.status === 'responded'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {inq.status === 'new'
                          ? 'New'
                          : inq.status === 'in_progress'
                            ? 'In Progress'
                            : inq.status === 'responded'
                              ? 'Responded'
                              : 'Closed'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentInquiries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No recent inquiries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
