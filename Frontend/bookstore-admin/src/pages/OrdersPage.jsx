import { useEffect, useMemo, useRef, useState } from 'react';

import MaterialIcon from '../components/MaterialIcon';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tất cả đơn' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const PAYMENT_STATUS_FILTERS = [
  { value: 'ALL', label: 'Mọi thanh toán' },
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

const PAGE_SIZE = 8;

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return '0đ';
  return `${Number(value).toLocaleString('vi-VN')}đ`;
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

function avatarTone(index) {
  const tones = [
    'bg-amber-50 text-amber-600',
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
    'bg-slate-100 text-slate-600',
    'bg-pink-50 text-pink-600',
  ];
  return tones[index % tones.length];
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

function paymentStatusLabel(status) {
  switch (status) {
    case 'UNPAID':
      return 'Chưa thanh toán';
    case 'PENDING':
      return 'Đang chờ';
    case 'PAID':
      return 'Đã thanh toán';
    case 'FAILED':
      return 'Thất bại';
    case 'REFUNDED':
      return 'Đã hoàn tiền';
    default:
      return status || '--';
  }
}

function paymentMethodLabel(method) {
  switch (method) {
    case 'COD':
      return 'Thanh toán khi nhận hàng';
    case 'BANK_TRANSFER':
      return 'Chuyển khoản ngân hàng';
    case 'ONLINE':
      return 'Thanh toán online';
    default:
      return method || '--';
  }
}

function buildOrderActions(order) {
  const actions = [{ key: 'view', label: 'Xem chi tiết', icon: 'visibility' }];

  if (order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus === 'PENDING' && order.status !== 'CANCELLED') {
    actions.push({ key: 'confirm_payment', label: 'Xác nhận đã nhận tiền', icon: 'payments' });
  }

  if (order.status === 'PENDING' || order.status === 'PENDING_PAYMENT') {
    actions.push({ key: 'confirm', label: 'Xác nhận đơn', icon: 'check_circle', status: 'CONFIRMED' });
    actions.push({ key: 'cancel', label: 'Hủy đơn', icon: 'cancel', status: 'CANCELLED', danger: true });
  } else if (order.status === 'CONFIRMED') {
    actions.push({ key: 'ship', label: 'Chuyển sang giao hàng', icon: 'local_shipping', status: 'SHIPPING' });
    actions.push({ key: 'cancel', label: 'Hủy đơn', icon: 'cancel', status: 'CANCELLED', danger: true });
  } else if (order.status === 'SHIPPING') {
    actions.push({ key: 'complete', label: 'Đánh dấu hoàn thành', icon: 'task_alt', status: 'COMPLETED' });
  }

  return actions;
}

function escapeCsv(value) {
  const normalized = String(value ?? '').replace(/"/g, '""');
  return `"${normalized}"`;
}

function downloadCsv(filename, content) {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function DetailPanel({ selectedOrder, onCloseDetail }) {
  if (!selectedOrder) return null;

  const status = statusMeta(selectedOrder.status);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Chi tiết đơn hàng</h3>
          <p className="mt-1 text-sm font-semibold text-slate-800">#{selectedOrder.orderId?.slice(0, 8)}</p>
        </div>
        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" type="button" onClick={onCloseDetail}>
          <MaterialIcon>close</MaterialIcon>
        </button>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Danh sách sách</h4>
          <div className="space-y-3">
            {(selectedOrder.items || []).map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <div className="h-16 w-12 overflow-hidden rounded border border-slate-100 bg-slate-50">
                  {item.image ? <img alt={item.title} className="h-full w-full object-cover" src={item.image} /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">Số lượng: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-slate-700">{formatCurrency(item.lineTotal)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Khách hàng</p>
            <p className="mt-3 font-bold text-slate-900">{selectedOrder.customerName || 'Chưa có tên'}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>{selectedOrder.customerEmail || '--'}</p>
              <p>{selectedOrder.phone || '--'}</p>
              <p>{selectedOrder.address || '--'}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Trạng thái hiện tại</p>
            <div className="mt-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${status.wrap}`}>
                <span className={`mr-2 h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-500">
              <p>Thanh toán: {paymentStatusLabel(selectedOrder.paymentStatus)}</p>
              <p>Hình thức: {paymentMethodLabel(selectedOrder.paymentMethod)}</p>
              <p>Mã tham chiếu: {selectedOrder.paymentReference || '--'}</p>
            </div>
            <p className="mt-4 text-lg font-bold text-slate-900">{formatCurrency(selectedOrder.totalPrice)}</p>
            <p className="mt-1 text-sm text-slate-500">Ngày đặt: {formatDateTime(selectedOrder.createdAt)}</p>
            <p className="mt-1 text-sm text-slate-500">Thanh toán lúc: {formatDateTime(selectedOrder.paidAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage({
  orders,
  loading,
  error,
  busyOrderId,
  searchValue,
  selectedOrder,
  detailLoading,
  onRefresh,
  onViewOrder,
  onCloseDetail,
  onUpdateStatus,
  onConfirmPayment,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [openMenuOrderId, setOpenMenuOrderId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const detailPanelRef = useRef(null);
  const menuWrapperRef = useRef(null);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = normalizeText(searchValue);
    const result = orders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === 'ALL' || (order.paymentStatus || 'UNPAID') === paymentStatusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [order.orderId, order.customerName, order.customerEmail, order.customerId, order.phone, order.address, order.paymentReference]
          .some((value) => normalizeText(value).includes(normalizedSearch));

      return matchesStatus && matchesPaymentStatus && matchesSearch;
    });

    result.sort((left, right) => {
      if (sortBy === 'amount_desc') return Number(right.totalPrice || 0) - Number(left.totalPrice || 0);
      if (sortBy === 'amount_asc') return Number(left.totalPrice || 0) - Number(right.totalPrice || 0);
      if (sortBy === 'oldest') return new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime();
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

    return result;
  }, [orders, paymentStatusFilter, searchValue, sortBy, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
  const pendingCount = orders.filter((order) => order.status === 'PENDING' || order.status === 'PENDING_PAYMENT').length;
  const shippingCount = orders.filter((order) => order.status === 'SHIPPING').length;
  const revenue = orders.reduce((total, order) => total + Number(order.totalPrice || 0), 0);

  useEffect(() => {
    if (!selectedOrder || detailLoading) return;
    detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedOrder, detailLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuWrapperRef.current?.contains(event.target)) {
        setOpenMenuOrderId('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCsv = () => {
    const header = ['Mã đơn', 'Khách hàng', 'Email', 'Tổng tiền', 'Trạng thái', 'Thanh toán', 'Hình thức', 'Mã tham chiếu', 'Ngày đặt'];
    const rows = filteredOrders.map((order) => [
      order.orderId,
      order.customerName,
      order.customerEmail,
      order.totalPrice,
      order.status,
      order.paymentStatus,
      paymentMethodLabel(order.paymentMethod),
      order.paymentReference,
      order.createdAt,
    ]);

    const csv = [header, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleRefreshOrders = async () => {
    setStatusFilter('ALL');
    setPaymentStatusFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
    setOpenMenuOrderId('');
    await onRefresh();
  };

  const startIndex = filteredOrders.length ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(safeCurrentPage * PAGE_SIZE, filteredOrders.length);

  return (
    <main className="ml-64 min-h-screen p-8">
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-8 shadow-lg md:col-span-8">
          <div className="relative z-10">
            <h2 className="mb-1 text-xs font-medium uppercase tracking-widest text-white/80">Tổng số đơn hàng</h2>
            <p className="mb-6 text-4xl font-bold tracking-tight text-white">{orders.length} đơn hàng</p>
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white/60">Doanh thu</span>
                <span className="text-lg font-bold text-white">{formatCurrency(revenue)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white/60">Chờ xử lý</span>
                <span className="text-lg font-bold text-white">{pendingCount}</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute bottom-0 left-1/2 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl transition-transform duration-700 group-hover:-translate-y-8" />
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-slate-100 bg-white p-8 shadow-sm md:col-span-4">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <MaterialIcon fill>local_shipping</MaterialIcon>
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">
                {orders.length ? `+${((shippingCount / orders.length) * 100).toFixed(1)}%` : '+0%'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Đang vận chuyển</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{shippingCount} đơn hàng</p>
          </div>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${orders.length ? Math.max((shippingCount / orders.length) * 100, 8) : 0}%` }} />
          </div>
        </div>
      </div>

      <section className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm lg:flex-nowrap">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">
          <MaterialIcon className="text-lg">filter_list</MaterialIcon>
          Bộ lọc:
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <span>Trạng thái</span>
          <select className="w-28 border-none bg-transparent pr-5 text-sm font-medium text-slate-900 focus:outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <span>Thanh toán</span>
          <select className="w-36 border-none bg-transparent pr-5 text-sm font-medium text-slate-900 focus:outline-none" value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)}>
            {PAYMENT_STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <span>Sắp xếp</span>
          <select className="w-24 border-none bg-transparent pr-5 text-sm font-medium text-slate-900 focus:outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="amount_desc">Tiền giảm dần</option>
            <option value="amount_asc">Tiền tăng dần</option>
          </select>
        </label>
        <div className="flex items-center gap-2 lg:ml-auto lg:flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={handleExportCsv} disabled={!filteredOrders.length}>
            <MaterialIcon className="text-lg">download</MaterialIcon>
            Xuất CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600" type="button" onClick={handleRefreshOrders}>
            <MaterialIcon className="text-lg">restart_alt</MaterialIcon>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </section>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        {error ? <p className="mx-6 mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="overflow-x-auto" ref={menuWrapperRef}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Mã đơn hàng</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Khách hàng</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">Tổng tiền</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Ngày đặt</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!loading && !paginatedOrders.length ? (
                <tr>
                  <td className="px-6 py-12 text-center text-sm text-slate-500" colSpan={6}>
                    Không có đơn hàng nào để hiển thị.
                  </td>
                </tr>
              ) : null}

              {paginatedOrders.map((order, index) => {
                const status = statusMeta(order.status);
                const isBusy = busyOrderId === order.orderId;
                const isSelected = selectedOrder?.orderId === order.orderId;
                const actions = buildOrderActions(order);

                return (
                  <tr key={order.orderId} className={`group cursor-pointer transition-colors hover:bg-slate-50/30 ${isSelected ? 'bg-blue-50/40' : ''}`} onClick={() => onViewOrder(order.orderId)}>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <span className="block font-mono text-sm font-bold text-blue-600">#{order.orderId?.slice(0, 8)}</span>
                        <span className="block text-[11px] text-slate-500">{paymentMethodLabel(order.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${avatarTone(index)}`}>
                          {initialsOf(order.customerName || order.customerEmail)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{order.customerName || 'Chưa có tên'}</p>
                          <p className="text-[11px] font-medium text-slate-500">{order.customerEmail || '--'}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-5 text-right text-sm font-bold ${order.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.wrap}`}>
                          <span className={`mr-2 h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        <p className="text-[11px] font-medium text-slate-500">{paymentStatusLabel(order.paymentStatus)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-500">{formatDateTime(order.createdAt)}</td>
                    <td className="relative px-6 py-5 text-right">
                      <button
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:opacity-50"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuOrderId((current) => (current === order.orderId ? '' : order.orderId));
                        }}
                        disabled={isBusy}
                      >
                        <MaterialIcon className="text-[20px]">{detailLoading && isSelected ? 'progress_activity' : 'more_vert'}</MaterialIcon>
                      </button>

                      {openMenuOrderId === order.orderId ? (
                        <div className="absolute right-6 top-14 z-20 min-w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-xl" onClick={(event) => event.stopPropagation()}>
                          {actions.map((action) => (
                            <button
                              key={action.key}
                              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                                action.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                              type="button"
                              onClick={() => {
                                setOpenMenuOrderId('');
                                if (action.key === 'view') {
                                  onViewOrder(order.orderId);
                                  return;
                                }
                                if (action.key === 'confirm_payment') {
                                  onConfirmPayment(order);
                                  return;
                                }
                                onUpdateStatus(order, action.status);
                              }}
                            >
                              <MaterialIcon className="text-[18px]">{action.icon}</MaterialIcon>
                              <span>{action.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-tighter text-slate-500">
            Hiển thị {startIndex} - {endIndex} của {filteredOrders.length} đơn hàng
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded p-1 text-slate-500 transition-colors disabled:opacity-30" type="button" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}>
              <MaterialIcon className="text-[20px]">chevron_left</MaterialIcon>
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(Math.max(safeCurrentPage - 3, 0), Math.min(Math.max(safeCurrentPage - 3, 0) + 5, totalPages))
              .map((pageNumber) => (
                <button key={pageNumber} className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold ${pageNumber === safeCurrentPage ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white'}`} type="button" onClick={() => setCurrentPage(pageNumber)}>
                  {pageNumber}
                </button>
              ))}
            <button className="rounded p-1 text-slate-500 transition-colors disabled:opacity-30 hover:bg-white" type="button" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}>
              <MaterialIcon className="text-[20px]">chevron_right</MaterialIcon>
            </button>
          </div>
        </div>
      </div>

      <div ref={detailPanelRef}>
        <DetailPanel selectedOrder={selectedOrder} onCloseDetail={onCloseDetail} />
      </div>
    </main>
  );
}
