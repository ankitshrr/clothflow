import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MapPin,
  FolderTree,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';


const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Inquiries', href: '/admin/inquiries', icon: HelpCircle },
  { name: 'Stores', href: '/admin/stores', icon: MapPin },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            StyleStore
          </Link>
          <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive =
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
