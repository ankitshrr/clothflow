import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  onAuthClick: () => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  const categories = [
    { name: 'T-Shirts', href: '/category/t-shirts' },
    { name: 'Shirts', href: '/category/shirts' },
    { name: 'Tracks & Pants', href: '/category/tracks-pants' },
    { name: 'Jackets & Hoodies', href: '/category/jackets-hoodies' },
    { name: 'Sports Wear', href: '/category/sports-wear' },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              MenStore
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/wishlist"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              to="/cart"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {profile?.full_name || 'Account'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Orders
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 mt-2 py-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
