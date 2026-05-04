import { useMemo, useState } from 'react';

import MaterialIcon from '../components/MaterialIcon';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function formatCompactCurrency(value) {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}tr`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
  return `${amount}`;
}

function formatDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function initialsOf(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'KH';
}

function statusMeta(status) {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ xử lý', wrap: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' };
    case 'PENDING_PAYMENT':
      return { label: 'Chờ thanh toán', wrap: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100', dot: 'bg-fuchsia-500' };
    case 'CONFIRMED':
      return { label: 'Đã xác nhận', wrap: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' };
    case 'SHIPPING':
      return { label: 'Đang giao', wrap: 'bg-sky-50 text-sky-700 border-sky-100', dot: 'bg-sky-500' };
    case 'COMPLETED':
      return { label: 'Hoàn thành', wrap: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
    case 'CANCELLED':
      return { label: 'Đã hủy', wrap: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' };
    default:
      return { label: status || 'Không rõ', wrap: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
  }
}

function trendMeta(current, previous, stableLabel = 'Ổn định') {
  if (!previous && !current) {
    return { label: stableLabel, wrap: 'text-slate-400 bg-slate-50' };
  }

  if (!previous) {
    return { label: '+100%', wrap: 'text-emerald-600 bg-emerald-50' };
  }

  const delta = ((current - previous) / previous) * 100;
  if (Math.abs(delta) < 0.05) {
    return { label: stableLabel, wrap: 'text-slate-400 bg-slate-50' };
  }

  return {
    label: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`,
    wrap: delta > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50',
  };
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function aggregateRevenueByDay(orders) {
  const today = startOfDay(new Date());
  const values = Array.from({ length: 7 }, () => 0);

  orders.forEach((order) => {
    const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return;

    const diffDays = Math.floor((today - startOfDay(createdAt)) / 86400000);
    if (diffDays < 0 || diffDays > 6) return;

    const index = 6 - diffDays;
    values[index] += Number(order.totalPrice || 0);
  });

  return values.map((value, index) => ({
    label: DAY_LABELS[index],
    value,
    title: `${DAY_LABELS[index]}: ${formatCompactCurrency(value)}`,
  }));
}

function aggregateRevenueByMonth(orders) {
  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { year: date.getFullYear(), month: date.getMonth(), label: MONTH_LABELS[index], value: 0 };
  });

  orders.forEach((order) => {
    const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return;

    const bucket = buckets.find((item) => item.year === createdAt.getFullYear() && item.month === createdAt.getMonth());
    if (!bucket) return;
    bucket.value += Number(order.totalPrice || 0);
  });

  return buckets.map(({ label, value }) => ({
    label,
    value,
    title: `${label}: ${formatCompactCurrency(value)}`,
  }));
}

function DashboardPhase1({ books, users, orders, loading, searchValue, onRefresh, onNavigate }) {
  const [chartPeriod, setChartPeriod] = useState('week');

  const { thirtyDaysAgo, sixtyDaysAgo } = useMemo(() => {
    const now = new Date();
    const nextThirtyDaysAgo = new Date(now);
    nextThirtyDaysAgo.setDate(now.getDate() - 30);
    const nextSixtyDaysAgo = new Date(now);
    nextSixtyDaysAgo.setDate(now.getDate() - 60);
    return {
      thirtyDaysAgo: nextThirtyDaysAgo,
      sixtyDaysAgo: nextSixtyDaysAgo,
    };
  }, []);

  const currentOrders = useMemo(
    () => orders.filter((order) => {
      const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
      return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= thirtyDaysAgo;
    }),
    [orders, thirtyDaysAgo],
  );

  const previousOrders = useMemo(
    () => orders.filter((order) => {
      const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
      return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }),
    [orders, sixtyDaysAgo, thirtyDaysAgo],
  );

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const currentRevenue = currentOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const revenueTrend = trendMeta(currentRevenue, previousRevenue);
  const orderTrend = trendMeta(currentOrders.length, previousOrders.length);
  const bookTrend = trendMeta(
    books.filter((book) => Number(book.stock || 0) > 0).length,
    books.filter((book) => Number(book.stock || 0) <= 0).length,
    'Theo tồn kho',
  );
  const userTrend = trendMeta(
    users.filter((user) => user.status === 'ACTIVE').length,
    users.filter((user) => user.status !== 'ACTIVE').length,
    'Theo trạng thái',
  );

  const dashboardStats = [
    ['payments', 'bg-blue-50 text-blue-600', revenueTrend.label, revenueTrend.wrap, 'Tổng doanh thu', formatCurrency(totalRevenue)],
    ['shopping_bag', 'bg-violet-50 text-violet-600', orderTrend.label, orderTrend.wrap, 'Tổng đơn hàng', `${orders.length}`],
    ['book', 'bg-amber-50 text-amber-600', bookTrend.label, bookTrend.wrap, 'Tổng số sách', `${books.length}`],
    ['person_add', 'bg-teal-50 text-teal-600', userTrend.label, userTrend.wrap, 'Tổng người dùng', `${users.length}`],
  ];

  const chartData = useMemo(
    () => (chartPeriod === 'week' ? aggregateRevenueByDay(orders) : aggregateRevenueByMonth(orders)),
    [chartPeriod, orders],
  );

  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);

  const topCategories = useMemo(() => {
    const categoryMap = new Map();

    books.forEach((book) => {
      const key = (book.category || 'Chưa phân loại').trim() || 'Chưa phân loại';
      const current = categoryMap.get(key) || 0;
      categoryMap.set(key, current + 1);
    });

    const wraps = [
      'bg-blue-50 text-blue-600',
      'bg-violet-50 text-violet-600',
      'bg-amber-50 text-amber-600',
      'bg-teal-50 text-teal-600',
    ];

    return Array.from(categoryMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([title, count], index) => ({
        title,
        subtitle: `${count} đầu sách`,
        share: books.length ? `${Math.round((count / books.length) * 100)}%` : '0%',
        wrap: wraps[index % wraps.length],
        icon: ['auto_stories', 'menu_book', 'library_books', 'collections_bookmark'][index % 4],
      }));
  }, [books]);

  const recentOrders = useMemo(
    () => [...orders]
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
      .slice(0, 5),
    [orders],
  );

  const pendingCount = orders.filter((order) => order.status === 'PENDING' || order.status === 'PENDING_PAYMENT').length;
  const shippingCount = orders.filter((order) => order.status === 'SHIPPING').length;
  const activeUsers = users.filter((user) => user.status === 'ACTIVE').length;
  const hasSearch = Boolean(String(searchValue || '').trim());

  return (
    <main className="ml-64 min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bảng điều khiển</h2>
            <p className="mt-1 text-slate-500">Tổng quan nhanh về sách, người dùng và đơn hàng trong hệ thống.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
              type="button"
              onClick={() => onNavigate('orders')}
            >
              <MaterialIcon className="text-lg">shopping_cart</MaterialIcon>
              Xem đơn hàng
            </button>
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
              type="button"
              onClick={onRefresh}
            >
              <MaterialIcon className="text-lg">restart_alt</MaterialIcon>
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        </div>

        {hasSearch ? (
          <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">Kết quả cho &quot;{searchValue}&quot;</p>
                <p className="text-sm text-blue-700">Dashboard đang lọc dữ liệu theo từ khóa bạn nhập.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-medium text-blue-900">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">{books.length} sách</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">{users.length} người dùng</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">{orders.length} đơn hàng</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map(([icon, iconWrap, change, changeWrap, label, value]) => (
            <div key={label} className="group flex flex-col justify-between rounded-lg border border-slate-100/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-lg p-2 ${iconWrap}`}><MaterialIcon>{icon}</MaterialIcon></div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${changeWrap}`}>{change}</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ['schedule', 'Đơn chờ xử lý', `${pendingCount} đơn`, 'bg-amber-50 text-amber-600'],
            ['local_shipping', 'Đang giao hàng', `${shippingCount} đơn`, 'bg-blue-50 text-blue-600'],
            ['groups', 'Người dùng hoạt động', `${activeUsers} tài khoản`, 'bg-emerald-50 text-emerald-600'],
          ].map(([icon, label, value, wrap]) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${wrap}`}>
                  <MaterialIcon fill>{icon}</MaterialIcon>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-100/50 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h3>
                <p className="text-sm text-slate-500">Dữ liệu lấy trực tiếp từ các đơn hàng hiện có.</p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${chartPeriod === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  type="button"
                  onClick={() => setChartPeriod('week')}
                >
                  Tuần
                </button>
                <button
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${chartPeriod === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  type="button"
                  onClick={() => setChartPeriod('month')}
                >
                  Tháng
                </button>
              </div>
            </div>
            <div className="chart-gradient relative flex h-64 items-end justify-between gap-3 rounded-lg px-4 pb-2">
              {chartData.map((item) => {
                const height = Math.max((item.value / maxChartValue) * 100, item.value > 0 ? 10 : 4);
                const active = item.value === maxChartValue;

                return (
                  <div
                    key={item.label}
                    className={`flex-1 rounded-t transition-all ${active ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600/20 hover:bg-blue-600/35'}`}
                    style={{ height: `${height}%` }}
                    title={item.title}
                  />
                );
              })}
            </div>
            <div className="mt-4 flex justify-between gap-3 px-2">
              {chartData.map((item) => (
                <div key={item.label} className="flex-1 text-center">
                  <span className="block text-xs font-medium text-slate-400">{item.label}</span>
                  <span className="mt-1 block text-[11px] font-semibold text-slate-500">{formatCompactCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-slate-100/50 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Danh mục nổi bật</h3>
            <div className="space-y-6">
              {topCategories.length ? topCategories.map((item) => (
                <div key={item.title} className="group flex cursor-default items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${item.wrap}`}>
                      <MaterialIcon className="text-lg">{item.icon}</MaterialIcon>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.share}</span>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Chưa có dữ liệu danh mục để hiển thị.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-100/50 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Đơn hàng gần đây</h3>
              <p className="text-sm text-slate-500">Danh sách các đơn hàng mới nhất trong hệ thống.</p>
            </div>
            <button
              className="flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
              type="button"
              onClick={() => onNavigate('orders')}
            >
              <MaterialIcon className="text-lg">east</MaterialIcon>
              Đi tới đơn hàng
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Mã đơn', 'Khách hàng', 'Ngày đặt', 'Tổng tiền', 'Trạng thái'].map((head) => (
                    <th key={head} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length ? recentOrders.map((order) => {
                  const status = statusMeta(order.status);
                  return (
                    <tr
                      key={order.orderId}
                      className="cursor-pointer transition-colors hover:bg-slate-50/50"
                      onClick={() => onNavigate('orders')}
                    >
                      <td className="px-6 py-4 font-semibold text-blue-600">#{order.orderId?.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold uppercase text-blue-700">
                            {initialsOf(order.customerName || order.customerEmail)}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{order.customerName || 'Chưa có tên'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(order.createdAt)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(order.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.wrap}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan="5">
                      Chưa có đơn hàng để hiển thị.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DashboardPhase1;
