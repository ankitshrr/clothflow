import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MapPin,
  FolderTree,
  HelpCircle,
  ExternalLink,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20">
        <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
          MenStore
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 rounded-md"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg md:shadow-sm flex flex-col flex-shrink-0 z-40 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 hidden md:block">
          <Link to="/" className="text-2xl font-bold text-gray-900 flex items-center gap-2 hover:text-gray-600 transition-colors">
            MenStore
          </Link>
          <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
        </div>

        {/* Mobile menu header */}
        <div className="p-4 border-b border-gray-100 md:hidden flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Admin Menu</h2>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-500 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 md:mt-6 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
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

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
          >
            <ExternalLink className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
