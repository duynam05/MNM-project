import './App.css';

import { useCallback, useEffect, useState } from 'react';

import MaterialIcon from './components/MaterialIcon';
import { USER_APP_LOGIN_URL } from './config/api';
import { apiRequest } from './lib/apiClient';
import { BooksPhase1, BookFormPhase1 } from './pages/BooksPhase1';
import DashboardPhase1 from './pages/DashboardPhase1';
import OrdersPage from './pages/OrdersPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ReviewsPage from './pages/ReviewsPage';
import SettingsPage from './pages/SettingsPage';
import { UsersPhase1, UserFormPhase1 } from './pages/UsersPhase1';

const TOKEN_STORAGE_KEY = 'admin_token';

const pages = [
  { key: 'dashboard', label: 'Bảng điều khiển', icon: 'dashboard' },
  { key: 'books', label: 'Sách', icon: 'book' },
  { key: 'users', label: 'Người dùng', icon: 'group' },
  { key: 'orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { key: 'reports', label: 'Báo cáo', icon: 'analytics' },
  { key: 'settings', label: 'Cài đặt', icon: 'settings' },
];

function getPageFromHash() {
  if (typeof window === 'undefined') return 'dashboard';
  return window.location.hash.replace('#', '') || 'dashboard';
}

function extractTokenFromUrl() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  if (!token) return null;
  url.searchParams.delete('token');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return token;
}

function formatError(error) {
  return error instanceof Error ? error.message : 'Có lỗi xảy ra';
}

function initialsOf(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AD';
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function SideNav({ currentPage, onNavigate, onLogout }) {
  const subtitle = 'Hệ thống quản lý sách';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 font-['Inter'] antialiased tracking-tight">
      <div className="mb-8 px-8 py-6">
        <h1 className="text-xl font-bold tracking-tighter text-slate-900">BookStore</h1>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{subtitle}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {pages.map((item) => {
          const active =
            currentPage === item.key ||
            (item.key === 'books' && currentPage.startsWith('book-')) ||
            (item.key === 'users' && currentPage.startsWith('user-'));

          return (
            <button
              key={item.key}
              className={`flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                item.key === 'settings' ? (active ? 'order-3 rounded-lg bg-blue-50/50 font-semibold text-blue-600' : 'order-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900') : (active ? 'rounded-lg bg-blue-50/50 font-semibold text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
              }`}
              type="button"
              onClick={() => onNavigate(item.key)}
            >
              <MaterialIcon fill={active}>{item.icon}</MaterialIcon>
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          className={`flex items-center gap-3 px-4 py-2 text-left transition-colors ${
            currentPage === 'reviews' ? 'order-2 rounded-lg bg-blue-50/50 font-semibold text-blue-600' : 'order-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          type="button"
          onClick={() => onNavigate('reviews')}
        >
          <MaterialIcon fill={currentPage === 'reviews'}>reviews</MaterialIcon>
          <span>Đánh giá</span>
        </button>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center gap-3 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900" type="button" onClick={onLogout}>
          <MaterialIcon>logout</MaterialIcon>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

function TopBar({ currentPage, adminUser, searchValue, onSearchChange }) {
  const placeholder =
    currentPage === 'dashboard'
      ? 'Tìm kiếm sách, đơn hàng...'
      : currentPage === 'books'
        ? 'Tìm kiếm sách, tác giả hoặc ISBN...'
        : currentPage === 'users'
          ? 'Tìm kiếm người dùng...'
          : currentPage === 'orders'
            ? 'Tìm kiếm đơn hàng...'
            : 'Tìm kiếm trong hệ thống...';

  return (
    <header className="sticky top-0 right-0 z-30 ml-64 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-8 shadow-sm backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <div className="group relative w-full max-w-md rounded-full focus-within:ring-2 focus-within:ring-blue-500/20">
          <input
            className="w-full rounded-full border-none bg-slate-100 py-2 pl-10 pr-4 text-sm transition-all focus:ring-0"
            placeholder={placeholder}
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <MaterialIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</MaterialIcon>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-500" type="button">
          <MaterialIcon>notifications</MaterialIcon>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{adminUser.fullName || adminUser.email}</p>
            <p className="text-[10px] font-medium uppercase tracking-tight text-slate-500">ADMIN</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-blue-100 text-xs font-bold text-blue-700 shadow-sm">
            {initialsOf(adminUser.fullName || adminUser.email)}
          </div>
        </div>
      </div>
    </header>
  );
}

function AuthGate({ status, authError, onGoLogin }) {
  const title = status === 'unauthorized' ? 'Không có quyền truy cập' : 'Cần đăng nhập quản trị';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),transparent_28%),linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_100%)] p-6">
      <div className="mx-auto mt-28 w-full max-w-xl rounded-3xl bg-white/95 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{authError || 'Vui lòng đăng nhập bằng tài khoản ADMIN từ giao diện người dùng.'}</p>
        <button className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700" type="button" onClick={onGoLogin}>
          Đi tới đăng nhập
        </button>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState(getPageFromHash);
  const [token, setToken] = useState(() => (typeof window === 'undefined' ? '' : localStorage.getItem(TOKEN_STORAGE_KEY) || ''));
  const [authStatus, setAuthStatus] = useState('loading');
  const [authError, setAuthError] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [booksError, setBooksError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [userFormError, setUserFormError] = useState('');
  const [bookFormError, setBookFormError] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [submittingBook, setSubmittingBook] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [busyUserId, setBusyUserId] = useState('');
  const [busyBookId, setBusyBookId] = useState('');
  const [busyOrderId, setBusyOrderId] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('all');
  const [bookStockFilter, setBookStockFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');

  useEffect(() => {
    const nextToken = extractTokenFromUrl();
    if (!nextToken) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);

  useEffect(() => {
    if (!token) {
      setAuthStatus('guest');
      setAdminUser(null);
      return;
    }

    let active = true;

    const loadProfile = async () => {
      setAuthStatus('loading');
      setAuthError('');
      try {
        const profile = await apiRequest('/users/my-info', { token });
        const isAdmin = profile.roles?.some((role) => role.name === 'ADMIN');

        if (!isAdmin) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          if (active) {
            setToken('');
            setAuthStatus('unauthorized');
            setAuthError('Tài khoản hiện tại không có quyền ADMIN.');
          }
          return;
        }

        if (active) {
          setAdminUser(profile);
          setAuthStatus('authenticated');
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (active) {
          setToken('');
          setAuthStatus('guest');
          setAuthError(formatError(error));
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [token]);

  const navigate = (nextPage) => {
    if (nextPage === 'orders') {
      setSelectedOrder(null);
      setOrderDetailLoading(false);
    }
    window.location.hash = nextPage;
    setPage(nextPage);
  };

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const [userList, roleList] = await Promise.all([apiRequest('/users', { token }), apiRequest('/roles', { token })]);
      setUsers(userList);
      setRoles(roleList);
    } catch (error) {
      setUsersError(formatError(error));
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  const loadBooks = useCallback(async () => {
    setBooksLoading(true);
    setBooksError('');
    try {
      const response = await apiRequest('/books?page=0&size=50&sort=title_asc', { token });
      setBooks(response.content || []);
    } catch (error) {
      setBooksError(formatError(error));
    } finally {
      setBooksLoading(false);
    }
  }, [token]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const orderList = await apiRequest('/api/orders/admin', { token });
      setOrders(orderList);
      setSelectedOrder((current) => {
        if (!current) return null;
        return orderList.find((order) => order.orderId === current.orderId) || null;
      });
    } catch (error) {
      setOrdersError(formatError(error));
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  const resetBookFilters = () => {
    setBookSearch('');
    setBookCategoryFilter('all');
    setBookStockFilter('all');
  };

  const resetUserFilters = () => {
    setUserSearch('');
    setUserRoleFilter('all');
    setUserStatusFilter('all');
  };

  const handleRefreshBooks = async () => {
    resetBookFilters();
    await loadBooks();
  };

  const handleRefreshUsers = async () => {
    resetUserFilters();
    await loadUsers();
  };

  const handleRefreshOrders = async () => {
    setOrderSearch('');
    setSelectedOrder(null);
    setOrderDetailLoading(false);
    await loadOrders();
  };

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    loadUsers();
    loadBooks();
    loadOrders();
  }, [authStatus, loadBooks, loadOrders, loadUsers]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    window.location.href = USER_APP_LOGIN_URL;
  };

  const handleAdminProfileUpdated = (updatedProfile) => {
    setAdminUser(updatedProfile);
  };

  const handleCreateUser = async (payload) => {
    setSubmittingUser(true);
    setUserFormError('');
    try {
      const createdUser = await apiRequest('/users', {
        token,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          fullName: payload.fullName,
          roles: payload.roles,
        }),
      });

      if (payload.status === 'DISABLED') {
        await apiRequest(`/users/${createdUser.id}/status`, {
          token,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'DISABLED' }),
        });
      }

      await loadUsers();
      navigate('users');
    } catch (error) {
      setUserFormError(formatError(error));
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleUpdateUser = async (payload) => {
    if (!editingUser) return;
    setSubmittingUser(true);
    setUserFormError('');
    try {
      await apiRequest(`/users/${editingUser.id}`, {
        token,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: payload.fullName, roles: payload.roles }),
      });

      if (payload.status !== editingUser.status) {
        await apiRequest(`/users/${editingUser.id}/status`, {
          token,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: payload.status }),
        });
      }

      await loadUsers();
      setEditingUser(null);
      navigate('users');
    } catch (error) {
      setUserFormError(formatError(error));
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    setBusyUserId(user.id);
    setUsersError('');
    try {
      await apiRequest(`/users/${user.id}/status`, {
        token,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' }),
      });
      await loadUsers();
    } catch (error) {
      setUsersError(formatError(error));
    } finally {
      setBusyUserId('');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Xóa tài khoản ${user.email}?`)) return;
    setBusyUserId(user.id);
    setUsersError('');
    try {
      await apiRequest(`/users/${user.id}`, { token, method: 'DELETE' });
      await loadUsers();
    } catch (error) {
      setUsersError(formatError(error));
    } finally {
      setBusyUserId('');
    }
  };

  const handleUploadBookImage = async (file) => {
    setUploadLoading(true);
    setBookFormError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiRequest('/books/upload-image', { token, method: 'POST', body: formData });
      return result.url;
    } catch (error) {
      setBookFormError(formatError(error));
      return '';
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCreateBook = async (payload) => {
    setSubmittingBook(true);
    setBookFormError('');
    try {
      await apiRequest('/books', {
        token,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadBooks();
      navigate('books');
    } catch (error) {
      setBookFormError(formatError(error));
    } finally {
      setSubmittingBook(false);
    }
  };

  const handleUpdateBook = async (payload) => {
    if (!editingBook) return;
    setSubmittingBook(true);
    setBookFormError('');
    try {
      await apiRequest(`/books/${editingBook.id}`, {
        token,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadBooks();
      setEditingBook(null);
      navigate('books');
    } catch (error) {
      setBookFormError(formatError(error));
    } finally {
      setSubmittingBook(false);
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Xóa sách "${book.title}"?`)) return;
    setBusyBookId(book.id);
    setBooksError('');
    try {
      await apiRequest(`/books/${book.id}`, { token, method: 'DELETE' });
      await loadBooks();
    } catch (error) {
      setBooksError(formatError(error));
    } finally {
      setBusyBookId('');
    }
  };

  const handleViewOrder = async (orderId) => {
    setOrderDetailLoading(true);
    setOrdersError('');
    try {
      const detail = await apiRequest(`/api/orders/admin/${orderId}`, { token });
      setSelectedOrder(detail);
    } catch (error) {
      setOrdersError(formatError(error));
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (order, nextStatus) => {
    const actionLabel = nextStatus === 'CANCELLED' ? 'hủy' : 'cập nhật';
    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} đơn ${order.orderId}?`)) return;

    setBusyOrderId(order.orderId);
    setOrdersError('');
    try {
      const updatedOrder = await apiRequest(`/api/orders/admin/${order.orderId}/status`, {
        token,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      setOrders((current) => current.map((item) => (item.orderId === updatedOrder.orderId ? updatedOrder : item)));
      setSelectedOrder((current) => (current?.orderId === updatedOrder.orderId ? updatedOrder : current));
    } catch (error) {
      setOrdersError(formatError(error));
    } finally {
      setBusyOrderId('');
    }
  };

  const handleConfirmOrderPayment = async (order) => {
    if (!window.confirm(`Xác nhận đã nhận chuyển khoản cho đơn ${order.orderId}?`)) return;

    setBusyOrderId(order.orderId);
    setOrdersError('');
    try {
      const updatedOrder = await apiRequest(`/api/orders/admin/${order.orderId}/confirm-payment`, {
        token,
        method: 'POST',
      });

      setOrders((current) => current.map((item) => (item.orderId === updatedOrder.orderId ? updatedOrder : item)));
      setSelectedOrder((current) => (current?.orderId === updatedOrder.orderId ? updatedOrder : current));
    } catch (error) {
      setOrdersError(formatError(error));
    } finally {
      setBusyOrderId('');
    }
  };

  if (authStatus === 'loading') {
    return <AuthGate status="loading" authError="Đang xác thực tài khoản quản trị..." onGoLogin={() => { window.location.href = USER_APP_LOGIN_URL; }} />;
  }

  if (authStatus !== 'authenticated') {
    return <AuthGate status={authStatus} authError={authError} onGoLogin={() => { window.location.href = USER_APP_LOGIN_URL; }} />;
  }

  const normalizedBookSearch = normalizeText(bookSearch);
  const bookCategories = Array.from(new Set(
    books.map((book) => (book.category || '').trim()).filter(Boolean),
  )).sort((left, right) => left.localeCompare(right, 'vi'));

  const visibleBooks = books.filter((book) => {
    const matchesSearch =
      !normalizedBookSearch ||
      [book.title, book.author, book.category, book.id].some((value) => normalizeText(value).includes(normalizedBookSearch));

    const matchesCategory = bookCategoryFilter === 'all' || (book.category || '').trim() === bookCategoryFilter;

    const stock = Number(book.stock || 0);
    const matchesStock =
      bookStockFilter === 'all' ||
      (bookStockFilter === 'in-stock' && stock > 0) ||
      (bookStockFilter === 'low-stock' && stock > 0 && stock < 10) ||
      (bookStockFilter === 'out-of-stock' && stock <= 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const normalizedUserSearch = normalizeText(userSearch);
  const userRoleOptions = Array.from(
    new Set(users.flatMap((user) => user.roles?.map((role) => role.name) || [])),
  ).sort((left, right) => left.localeCompare(right, 'vi'));

  const visibleUsers = users.filter((user) => {
    const matchesSearch =
      !normalizedUserSearch ||
      [user.fullName, user.email, user.id, ...(user.roles?.map((role) => role.name) || [])]
        .some((value) => normalizeText(value).includes(normalizedUserSearch));

    const matchesRole = userRoleFilter === 'all' || user.roles?.some((role) => role.name === userRoleFilter);
    const matchesStatus = userStatusFilter === 'all' || (user.status || 'ACTIVE') === userStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const normalizedDashboardSearch = normalizeText(dashboardSearch);
  const visibleDashboardBooks = books.filter((book) => (
    !normalizedDashboardSearch ||
    [book.title, book.author, book.category, book.id]
      .some((value) => normalizeText(value).includes(normalizedDashboardSearch))
  ));

  const visibleDashboardUsers = users.filter((user) => (
    !normalizedDashboardSearch ||
    [user.fullName, user.email, user.id, ...(user.roles?.map((role) => role.name) || [])]
      .some((value) => normalizeText(value).includes(normalizedDashboardSearch))
  ));

  const visibleDashboardOrders = orders.filter((order) => (
    !normalizedDashboardSearch ||
    [order.orderId, order.customerName, order.customerEmail, order.customerId, order.phone, order.address]
      .some((value) => normalizeText(value).includes(normalizedDashboardSearch))
  ));

  let content = (
    <DashboardPhase1
      books={visibleDashboardBooks}
      users={visibleDashboardUsers}
      orders={visibleDashboardOrders}
      loading={booksLoading || usersLoading || ordersLoading}
      searchValue={dashboardSearch}
      onRefresh={async () => {
        setDashboardSearch('');
        await Promise.all([loadBooks(), loadUsers(), loadOrders()]);
      }}
      onNavigate={navigate}
    />
  );

  if (page === 'books') {
    content = (
      <BooksPhase1
        books={visibleBooks}
        loading={booksLoading}
        error={booksError}
        busyBookId={busyBookId}
        categoryOptions={bookCategories}
        selectedCategory={bookCategoryFilter}
        selectedStock={bookStockFilter}
        onCreate={() => {
          setEditingBook(null);
          setBookFormError('');
          navigate('book-create');
        }}
        onEdit={(book) => {
          setEditingBook(book);
          setBookFormError('');
          navigate('book-edit');
        }}
        onDelete={handleDeleteBook}
        onRefresh={handleRefreshBooks}
        onCategoryChange={setBookCategoryFilter}
        onStockChange={setBookStockFilter}
      />
    );
  } else if (page === 'book-create') {
    content = (
      <BookFormPhase1
        key="book-create"
        mode="create"
        submitting={submittingBook}
        uploadLoading={uploadLoading}
        error={bookFormError}
        onCancel={() => navigate('books')}
        onSubmit={handleCreateBook}
        onUploadImage={handleUploadBookImage}
      />
    );
  } else if (page === 'book-edit') {
    content = (
      <BookFormPhase1
        key={`book-edit:${editingBook?.id || 'none'}`}
        mode="edit"
        book={editingBook}
        submitting={submittingBook}
        uploadLoading={uploadLoading}
        error={bookFormError}
        onCancel={() => navigate('books')}
        onSubmit={handleUpdateBook}
        onUploadImage={handleUploadBookImage}
      />
    );
  } else if (page === 'users') {
    content = (
      <UsersPhase1
        users={visibleUsers}
        loading={usersLoading}
        error={usersError}
        busyUserId={busyUserId}
        roleOptions={userRoleOptions}
        selectedRole={userRoleFilter}
        selectedStatus={userStatusFilter}
        onCreate={() => {
          setEditingUser(null);
          setUserFormError('');
          navigate('user-create');
        }}
        onEdit={(user) => {
          setEditingUser(user);
          setUserFormError('');
          navigate('user-edit');
        }}
        onToggleStatus={handleToggleUserStatus}
        onDelete={handleDeleteUser}
        onRoleChange={setUserRoleFilter}
        onStatusChange={setUserStatusFilter}
        onRefresh={handleRefreshUsers}
      />
    );
  } else if (page === 'user-create') {
    content = (
      <UserFormPhase1
        key="user-create"
        mode="create"
        roles={roles.length ? roles : [{ name: 'USER' }, { name: 'ADMIN' }]}
        submitting={submittingUser}
        error={userFormError}
        onCancel={() => navigate('users')}
        onSubmit={handleCreateUser}
      />
    );
  } else if (page === 'user-edit') {
    content = (
      <UserFormPhase1
        key={`user-edit:${editingUser?.id || 'none'}`}
        mode="edit"
        user={editingUser}
        roles={roles.length ? roles : [{ name: 'USER' }, { name: 'ADMIN' }]}
        submitting={submittingUser}
        error={userFormError}
        onCancel={() => navigate('users')}
        onSubmit={handleUpdateUser}
      />
    );
  } else if (page === 'orders') {
    content = (
      <OrdersPage
        orders={orders}
        loading={ordersLoading}
        error={ordersError}
        busyOrderId={busyOrderId}
        searchValue={orderSearch}
        selectedOrder={selectedOrder}
        detailLoading={orderDetailLoading}
        onRefresh={handleRefreshOrders}
        onViewOrder={handleViewOrder}
        onCloseDetail={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onConfirmPayment={handleConfirmOrderPayment}
      />
    );
  } else if (page === 'reviews') {
    content = <ReviewsPage token={token} searchValue={reviewSearch} />;
  } else if (page === 'reports') {
    content = <PlaceholderPage title="Báo cáo" description="" />;
  } else if (page === 'settings') {
    content = <SettingsPage adminUser={adminUser} token={token} onProfileUpdated={handleAdminProfileUpdated} />;
  }

  return (
    <div className="bg-white font-['Inter'] text-slate-900 antialiased">
      <SideNav currentPage={page} onNavigate={navigate} onLogout={handleLogout} />
      <TopBar
        currentPage={page}
        adminUser={adminUser}
        searchValue={page === 'dashboard' ? dashboardSearch : page === 'books' ? bookSearch : page === 'users' ? userSearch : page === 'orders' ? orderSearch : page === 'reviews' ? reviewSearch : ''}
        onSearchChange={page === 'dashboard' ? setDashboardSearch : page === 'books' ? setBookSearch : page === 'users' ? setUserSearch : page === 'orders' ? setOrderSearch : page === 'reviews' ? setReviewSearch : () => {}}
      />
      {content}
    </div>
  );
}

export default App;
