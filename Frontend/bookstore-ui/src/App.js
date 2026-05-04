import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart, BookOpen, LogIn, Package } from 'lucide-react';

import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {
  CartProvider,
  useCartActions,
  useCartState
} from './contexts/CartContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CheckoutPage from './pages/CheckoutPage';
import VNPayGateway from './pages/VNPayGateway';
import PrivateRoute from './components/PrivateRoute';
import OrderListPage from './pages/OrderListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PaymentResultPage from './pages/PaymentResultPage';

const Navbar = () => {
  const { cartItemCount } = useCartState();
  const { fetchCart } = useCartActions();
  const { user } = useAuth();

  const initialsOf = (value = '') =>
    value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'US';

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <BookOpen /> BookStore
          </Link>

          <div className="flex items-center gap-4 lg:hidden">
            <Link to="/books" className="hover:text-blue-600">Sách</Link>
            <Link to="/cart" className="relative p-2 hover:text-blue-600">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-6 font-medium lg:flex">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <Link to="/books" className="hover:text-blue-600">Sách</Link>

          <Link to="/account/orders" className="flex items-center gap-1 hover:text-blue-600">
            <Package size={20} />
            <span>Đơn hàng</span>
          </Link>

          <Link to="/cart" className="relative p-2 hover:text-blue-600">
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/account" className="group flex items-center gap-2 hover:text-blue-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-bold text-blue-700 shadow-sm">
                {initialsOf(user.fullName || user.name || user.email)}
              </div>
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700">
              <LogIn size={18} /> Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
              <Navbar />
              <main className="flex-grow">
                {/* <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<BookList />} />
                  <Route path="/book/:id" element={<BookDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/vnpay-gateway" element={<VNPayGateway />} />
                </Routes> */}
                <Routes>
                  {/* PUBLIC */}
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<BookList />} />
                  <Route path="/book/:id" element={<BookDetail />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* PROTECTED */}
                  <Route
                    path="/cart"
                    element={
                      <PrivateRoute>
                        <Cart />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/account"
                    element={
                      <PrivateRoute>
                        <AccountPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/checkout"
                    element={
                      <PrivateRoute>
                        <CheckoutPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/vnpay-gateway"
                    element={
                      <PrivateRoute>
                        <VNPayGateway />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/account/orders"
                    element={
                      <PrivateRoute>
                        <OrderListPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/account/orders/:orderId"
                    element={
                      <PrivateRoute>
                        <OrderDetailPage />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/payment-result"
                    element={
                      <PrivateRoute>
                        <PaymentResultPage />
                      </PrivateRoute>
                    }
                  />

                </Routes>

              </main>

              <ToastContainer
                position="top-right"
                autoClose={2000}
                newestOnTop
              />

              <footer className="mt-auto bg-gray-800 py-8 text-center text-white">
                <p>&copy; 2024 BookStore. All rights reserved.</p>
              </footer>
            </div>
          </Router>
        </CartProvider>
      </HistoryProvider>
    </AuthProvider>
  );
}

export default App;
