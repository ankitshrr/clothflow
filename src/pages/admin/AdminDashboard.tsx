import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
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
}

interface RecentOrder {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    const [productsRes, ordersRes, profilesRes, inventoryRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('orders').select('id, total, status'),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('inventory').select('quantity').lt('quantity', 10),
    ]);

    const totalRevenue =
      ordersRes.data?.reduce((sum, order) => {
        if (order.status === 'delivered' || order.status === 'shipped') {
          return sum + (order.total || 0);
        }
        return sum;
      }, 0) || 0;

    const pendingOrders = ordersRes.data?.filter((o) => o.status === 'pending').length || 0;

    setStats({
      totalProducts: productsRes.count || 0,
      totalOrders: ordersRes.data?.length || 0,
      totalCustomers: profilesRes.count || 0,
      totalRevenue,
      pendingOrders,
      lowStockProducts: inventoryRes.data?.filter((i) => i.quantity < 10).length || 0,
    });

    const { data: recentOrdersData } = await supabase
      .from('orders')
      .select('id, order_number, created_at, total, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersData) {
      setRecentOrders(recentOrdersData);
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
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      href: '/admin/customers',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      href: '/admin/orders',
      color: 'bg-yellow-50 text-yellow-600',
    },
  ];

  const alertCards = [
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      href: '/admin/orders?status=pending',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Low Stock Products',
      value: stats.lowStockProducts,
      href: '/admin/inventory',
      color: 'bg-red-50 text-red-600',
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
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
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

      <div className="grid md:grid-cols-2 gap-6">
        {alertCards.map((alert) => (
          <Link
            key={alert.title}
            to={alert.href}
            className={`rounded-lg p-6 ${alert.color} hover:opacity-90 transition-opacity`}
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

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
