import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Sun, Moon, ChevronDown, ChevronRight, Home, ShoppingBag, MapPin, Settings, Package, Shield, LogOut, Tags } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../ui/Toast';

interface HeaderProps {
  onAuthClick: () => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { showToast } = useToast();

  const getFirstName = () => {
    const fullName = profile?.full_name || user?.user_metadata?.full_name || '';
    if (fullName) {
      return fullName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Account';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
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
    <header className="bg-white text-gray-900 shadow-sm sticky top-0 z-40 transition-all border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
          
          {/* Left Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter text-black hover:text-gray-700 transition-colors uppercase">
              Reeback
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className="relative text-gray-600 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase py-1 group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
            </Link>
            
            <div className="relative group py-1"
                 onMouseEnter={() => setIsCategoryOpen(true)}
                 onMouseLeave={() => setIsCategoryOpen(false)}>
              <button className="flex items-center text-gray-600 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase outline-none">
                Categories
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : 'opacity-70'}`} />
              </button>
              
              <div className={`absolute top-full left-0 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-3 mt-4 transition-all duration-300 transform origin-top-left ${isCategoryOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="block px-5 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 hover:pl-7 transition-all duration-300"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/products"
              className="relative text-gray-600 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase py-1 group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
            </Link>

            <Link
              to="/wholesale"
              className="relative text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-bold tracking-widest uppercase py-1 group hidden lg:block"
            >
              Wholesale
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggleTheme}
              className="flex text-black hover:text-gray-500 transition-colors p-2"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Sun className="w-6 h-6" strokeWidth={1.5} />
              )}
            </button>

            {isSearchOpen ? (
              <div className="absolute inset-0 bg-white z-50 flex items-center px-4 md:static md:inset-auto md:bg-transparent md:px-0 md:z-auto md:flex">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full md:w-48 bg-gray-50 text-black text-base md:text-sm rounded-full pl-4 pr-10 py-2.5 md:py-1.5 focus:outline-none focus:ring-1 focus:ring-black transition-all border border-gray-200"
                    autoFocus
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-3 p-1 text-black hover:text-gray-500">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="text-black hover:text-gray-500 transition-colors p-2" aria-label="Search">
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </button>
            )}

            <Link
              to="/cart"
              className="flex text-black hover:text-gray-500 transition-colors p-2 relative"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0 bg-black text-white shadow-sm text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center space-x-2 text-black hover:text-gray-500 transition-colors p-2 outline-none">
                  <User className="w-6 h-6" strokeWidth={1.5} />
                </button>
                <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-2">
                    <span className="block text-sm text-gray-900 font-bold truncate">{profile?.full_name || user?.user_metadata?.full_name || getFirstName()}</span>
                    <span className="block text-xs text-gray-500 truncate">{user?.email}</span>
                  </div>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    My Orders
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await signOut();
                      showToast('Signed out successfully', 'success');
                      navigate('/');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors mt-2 border-t border-gray-100 pt-2"
                  >
                    Sign Out
                  </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="hidden md:flex text-black hover:text-gray-500 transition-colors p-2"
                aria-label="Sign in"
              >
                <User className="w-6 h-6" strokeWidth={1.5} />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-black hover:text-gray-500 p-1 ml-2"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden absolute top-16 left-0 w-full bg-dark/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-4 space-y-6">
            
            {/* User Profile Card for Mobile */}
            {user && (
              <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center text-gray-300">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white truncate">
                      {profile?.full_name || user?.user_metadata?.full_name || getFirstName()}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                      showToast('Signed out successfully', 'success');
                      navigate('/');
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-gray-700/50 pt-4">
                  <Link
                    to="/account"
                    className="flex items-center justify-center space-x-2 bg-gray-900/50 hover:bg-gray-700 p-2 rounded-lg text-sm font-medium text-gray-300 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center justify-center space-x-2 bg-gray-900/50 hover:bg-gray-700 p-2 rounded-lg text-sm font-medium text-gray-300 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    <span>Orders</span>
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="col-span-2 flex items-center justify-center space-x-2 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 p-2 rounded-lg text-sm font-medium transition-colors border border-emerald-900/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <div className="space-y-1.5">
              <Link
                to="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 active:scale-[0.98] transition-all group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:text-white group-hover:bg-gray-700 transition-colors">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-base font-medium text-gray-300 group-hover:text-white">Home</span>
              </Link>
              
              <Link
                to="/products"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 active:scale-[0.98] transition-all group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:text-white group-hover:bg-gray-700 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-base font-medium text-gray-300 group-hover:text-white">All Products</span>
              </Link>



              {/* Categories Accordion */}
              <div className="rounded-xl overflow-hidden group">
                <button
                  onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:text-white transition-colors">
                      <Tags className="w-5 h-5" />
                    </div>
                    <span className="text-base font-medium text-gray-300 group-hover:text-white transition-colors">Categories</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isMobileCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out bg-gray-900/30 ${isMobileCategoryOpen ? 'max-h-64 opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="flex items-center space-x-3 pl-[3.25rem] pr-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors border-l-2 border-transparent hover:border-emerald-500 ml-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/wholesale"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 active:scale-[0.98] transition-all group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-base font-medium text-emerald-400 group-hover:text-emerald-300">Wholesale</span>
              </Link>

              <Link
                to="/stores"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 active:scale-[0.98] transition-all group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:text-white group-hover:bg-gray-700 transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-base font-medium text-gray-300 group-hover:text-white">Our Stores</span>
              </Link>
            </div>




            {!user && (
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAuthClick();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-500 text-white px-4 py-3 rounded-xl text-base font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
