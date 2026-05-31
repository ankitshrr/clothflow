import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './components/ui/Toast';
import { Header, Footer } from './components/layout';
import { AuthModal } from './components/auth';
import { LoadingPage } from './components/ui/Loading';
import {
  HomePage,
  ProductsPage,
  CategoryPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  StoresPage,
  OrdersPage,
  AccountPage,
  UpdatePasswordPage,
  WholesalePage,
  WholesaleProductDetailPage,
} from './pages';
import {
  AdminDashboard,
  AdminProducts,
  AdminOrders,
  AdminStores,
  AdminCategories,
  AdminInquiries,
  AdminLayout,
} from './pages/admin';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useToast } from './components/ui/Toast';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        showToast('Successfully logged in!', 'success');
        
        // Check if this is a brand new account (created within the last 30 seconds)
        const isNewUser = Date.now() - new Date(session.user.created_at).getTime() < 30000;
        
        // Trigger security alert email silently
        try {
          await supabase.functions.invoke('security-alerts', {
            body: { type: isNewUser ? 'signup' : 'login' }
          });
        } catch (error) {
          console.error('Failed to send email alert:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="stores" element={<AdminStores />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inquiries" element={<AdminInquiries />} />
        </Route>
        <Route
          path="/*"
          element={
            <>
              <Header onAuthClick={() => setShowAuthModal(true)} />
              <main className="flex-1">
                <Routes>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="product/:slug" element={<ProductDetailPage />} />
                  <Route path="wholesale" element={<WholesalePage />} />
                  <Route path="wholesale/product/:slug" element={<WholesaleProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route
                    path="checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="stores" element={<StoresPage />} />
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="account"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="update-password" element={<UpdatePasswordPage />} />
                  <Route
                    path="wishlist"
                    element={
                      <ProtectedRoute>
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                              Wishlist
                            </h1>
                            <p className="text-gray-600 mb-6">
                              Your wishlist items will appear here
                            </p>
                          </div>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                          <p className="text-gray-600 mb-6">Page not found</p>
                          <a href="/" className="text-gray-900 hover:underline">
                            Go home
                          </a>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
