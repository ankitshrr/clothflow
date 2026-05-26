import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">MenStore</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium men's fashion in Nepal. Quality clothing for the modern man.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/stores"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Our Store
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/category/t-shirts"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link
                  to="/category/shirts"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Shirts
                </Link>
              </li>
              <li>
                <Link
                  to="/category/tracks-pants"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Tracks & Pants
                </Link>
              </li>
              <li>
                <Link
                  to="/category/jackets-hoodies"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Jackets & Hoodies
                </Link>
              </li>
              <li>
                <Link
                  to="/category/sports-wear"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Sports Wear
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Pepsi-Cola Town Planning Road, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a
                  href="mailto:pepsicola@menstore.com.np"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  pepsicola@menstore.com.np
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a
                  href="tel:+97714102030"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  +977 1-4102030
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MenStore Nepal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
