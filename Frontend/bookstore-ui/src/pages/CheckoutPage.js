import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BadgeDollarSign, Landmark, Lock, Wallet } from 'lucide-react';

import { buildApiUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { useCartActions } from '../contexts/CartContext';

const PHONE_REGEX = /^0\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAYMENT_OPTIONS = [
  {
    value: 'BANK_TRANSFER',
    title: 'Chuyển khoản ngân hàng',
    description: 'Quét QR và chờ hệ thống xác nhận giao dịch.',
    icon: Landmark,
    iconClassName: 'text-blue-700',
  },
  {
    value: 'E_WALLET',
    title: 'Ví điện tử MoMo / ZaloPay',
    description: 'Khung tích hợp bảo mật sẽ được triển khai ở bước tiếp theo.',
    icon: Wallet,
    iconClassName: 'text-violet-700',
  },
  {
    value: 'COD',
    title: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán sau khi nhận được sách.',
    icon: BadgeDollarSign,
    iconClassName: 'text-slate-600',
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value) || 0);
}

function copyText(value, successMessage) {
  if (!navigator?.clipboard) {
    toast.info('Trình duyệt hiện tại không hỗ trợ sao chép nhanh.');
    return;
  }

  navigator.clipboard.writeText(value)
    .then(() => toast.success(successMessage))
    .catch(() => toast.error('Không thể sao chép. Vui lòng thử lại.'));
}

function getPaymentSession(order) {
  return order?.paymentSession || null;
}

function getTransferReference(order) {
  return getPaymentSession(order)?.reference || order?.paymentReference || `DH-${order?.orderId?.slice(0, 8) || ''}`;
}

function getTransferInfo(order) {
  const session = getPaymentSession(order);
  return {
    bankName: session?.bankName || 'BIDV',
    accountNumber: session?.accountNumber || '8860383073',
    accountHolder: session?.accountHolder || 'TRINH DUY NAM',
    qrUrl: session?.qrUrl || '',
    paymentUrl: session?.paymentUrl || '',
    expiresAt: session?.expiresAt || '',
  };
}

async function fetchOrderById(orderId, token) {
  const response = await fetch(buildApiUrl(`/api/orders/${orderId}/payment-session`), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Không thể lấy trạng thái đơn hàng');
  }

  return data?.result;
}

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCart, resetCart } = useCartActions();

  const [form, setForm] = useState({
    name: user?.fullName || user?.name || user?.email || '',
    email: user?.email || '',
    phone: '',
    address: '',
    paymentMethod: 'BANK_TRANSFER',
    couponCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bankTransferOrder, setBankTransferOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.fullName || user.email || '',
      email: user.email || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!bankTransferOrder?.orderId) return undefined;
    if (bankTransferOrder.paymentStatus === 'PAID') return undefined;

    const token = localStorage.getItem('token');
    let active = true;

    const pollOrderStatus = async () => {
      try {
        const latestOrder = await fetchOrderById(bankTransferOrder.orderId, token);
        if (!active || !latestOrder) return;

        setBankTransferOrder(latestOrder);
        if (latestOrder.paymentStatus === 'PAID') {
          toast.success('Đã nhận thanh toán. Đang chuyển về trang đơn hàng.');
          navigate(`/account/orders/${latestOrder.orderId}`, { replace: true });
        }
      } catch {
        // Keep polling silently while the user is waiting on payment confirmation.
      }
    };

    const intervalId = window.setInterval(pollOrderStatus, 5000);
    pollOrderStatus();

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [bankTransferOrder, navigate]);

  const items = state?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * item.quantity, 0);
  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const validateField = (name, value) => {
    let message = '';

    switch (name) {
      case 'name':
        if (!value.trim()) message = 'Họ tên không được để trống';
        break;
      case 'email':
        if (!value.trim()) message = 'Email không được để trống';
        else if (!EMAIL_REGEX.test(value)) message = 'Email không hợp lệ';
        break;
      case 'phone':
        if (!value.trim()) message = 'Số điện thoại không được để trống';
        else if (!PHONE_REGEX.test(value)) message = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
        break;
      case 'address':
        if (!value.trim()) message = 'Địa chỉ không được để trống';
        break;
      default:
        break;
    }

    setErrors((prev) => {
      if (!message) {
        const { [name]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: message };
    });

    return message === '';
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Họ tên không được để trống';
    if (!form.email.trim()) nextErrors.email = 'Email không được để trống';
    else if (!EMAIL_REGEX.test(form.email)) nextErrors.email = 'Email không hợp lệ';
    if (!form.phone.trim()) nextErrors.phone = 'Số điện thoại không được để trống';
    else if (!PHONE_REGEX.test(form.phone)) nextErrors.phone = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
    if (!form.address.trim()) nextErrors.address = 'Địa chỉ không được để trống';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const syncCartBadge = async () => {
    try {
      await fetchCart();
    } catch {
      resetCart();
    }
  };

  const createOrder = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone: form.phone,
          address: form.address,
          paymentMethod: form.paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Tạo đơn thất bại');
      }

      return data.result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (form.paymentMethod === 'E_WALLET') {
      toast.info('MoMo / ZaloPay sẽ được triển khai ở giai đoạn tiếp theo.');
      return;
    }

    const order = await createOrder();
    if (!order) return;

    await syncCartBadge();

    if (form.paymentMethod === 'COD') {
      toast.success('Đặt hàng thành công');
      navigate('/account/orders');
      return;
    }

    setBankTransferOrder(order);
    toast.success('Đơn hàng đã được tạo. Vui lòng quét QR hoặc chuyển khoản theo hướng dẫn.');
  };

  if (!items.length && !bankTransferOrder) {
    return <div className="px-6 py-16 text-center text-slate-500">Không có sản phẩm để thanh toán.</div>;
  }

  if (bankTransferOrder) {
    const transferReference = getTransferReference(bankTransferOrder);
    const transferInfo = getTransferInfo(bankTransferOrder);

    return (
      <main className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-20">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Bank Transfer</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Chờ xác nhận chuyển khoản</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Đơn hàng của bạn đã được tạo thành công. Hãy quét mã QR dưới đây để app ngân hàng tự điền sẵn số tiền và nội dung chuyển khoản.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin chuyển khoản</h2>
              {transferInfo.qrUrl ? (
                <div className="mt-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
                  <img alt="QR chuyển khoản VietQR" className="h-auto w-full max-w-[320px]" src={transferInfo.qrUrl} />
                </div>
              ) : null}
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Ngân hàng</p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-900">{transferInfo.bankName}</p>
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50" type="button" onClick={() => copyText(transferInfo.bankName, 'Đã sao chép tên ngân hàng')}>
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Số tài khoản</p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-900">{transferInfo.accountNumber}</p>
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50" type="button" onClick={() => copyText(transferInfo.accountNumber, 'Đã sao chép số tài khoản')}>
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Chủ tài khoản</p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-900">{transferInfo.accountHolder}</p>
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50" type="button" onClick={() => copyText(transferInfo.accountHolder, 'Đã sao chép chủ tài khoản')}>
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Nội dung chuyển khoản</p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-blue-900">{transferReference}</p>
                    <button className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100" type="button" onClick={() => copyText(transferReference, 'Đã sao chép nội dung chuyển khoản')}>
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin đơn hàng</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Mã đơn hàng</span>
                  <span className="font-semibold text-slate-900">#{bankTransferOrder.orderId.slice(0, 8)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className="font-semibold text-amber-600">Chờ thanh toán</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Phương thức</span>
                  <span className="font-semibold text-slate-900">Chuyển khoản ngân hàng</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <span className="text-slate-500">Tổng thanh toán</span>
                  <span className="text-lg font-bold text-blue-700">{formatCurrency(bankTransferOrder.totalPrice)}</span>
                </div>
                {transferInfo.expiresAt ? (
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-slate-500">Hiệu lực phiên thanh toán</span>
                    <span className="font-semibold text-slate-900">{new Date(transferInfo.expiresAt).toLocaleString('vi-VN')}</span>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">
                  Hệ thống đang chờ webhook xác nhận từ payOS. Bạn có thể giữ nguyên trang này, khi thanh toán thành công hệ thống sẽ tự chuyển về trang đơn hàng.
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button className="w-full rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-blue-800" type="button" onClick={() => navigate(`/account/orders/${bankTransferOrder.orderId}`)}>
                  Xem chi tiết đơn hàng
                </button>
                <button className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={() => navigate('/account/orders')}>
                  Về danh sách đơn hàng
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 md:px-12 md:py-20">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="space-y-16 lg:col-span-7">
          <section>
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">Thông tin giao hàng</h2>
              <p className="text-sm text-slate-500">Vui lòng nhập đầy đủ thông tin để chúng tôi gửi sách đến bạn nhanh nhất.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-slate-500">Họ tên</label>
                <input
                  className={`rounded-xl border px-4 py-3 outline-none transition-all ${
                    errors.name ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200' : 'border-transparent bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((prev) => ({ ...prev, name: value }));
                    validateField('name', value);
                  }}
                  onBlur={(event) => validateField('name', event.target.value)}
                />
                {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-slate-500">Số điện thoại</label>
                <input
                  className={`rounded-xl border px-4 py-3 outline-none transition-all ${
                    errors.phone ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200' : 'border-transparent bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="090 123 4567"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((prev) => ({ ...prev, phone: value }));
                    validateField('phone', value);
                  }}
                  onBlur={(event) => validateField('phone', event.target.value)}
                />
                {errors.phone ? <p className="text-xs text-red-500">{errors.phone}</p> : null}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-slate-500">Email</label>
                <input
                  className={`rounded-xl border px-4 py-3 outline-none transition-all ${
                    errors.email ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200' : 'border-transparent bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="curator@example.com"
                  type="email"
                  value={form.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((prev) => ({ ...prev, email: value }));
                    validateField('email', value);
                  }}
                  onBlur={(event) => validateField('email', event.target.value)}
                />
                {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-slate-500">Địa chỉ chi tiết</label>
                <textarea
                  className={`resize-none rounded-xl border px-4 py-3 outline-none transition-all ${
                    errors.address ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200' : 'border-transparent bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố..."
                  rows="3"
                  value={form.address}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((prev) => ({ ...prev, address: value }));
                    validateField('address', value);
                  }}
                  onBlur={(event) => validateField('address', event.target.value)}
                />
                {errors.address ? <p className="text-xs text-red-500">{errors.address}</p> : null}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">Phương thức thanh toán</h2>
              <p className="text-sm text-slate-500">Chọn phương thức phù hợp nhất với bạn.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {PAYMENT_OPTIONS.map((option) => {
                const isSelected = form.paymentMethod === option.value;
                const Icon = option.icon;

                return (
                  <label
                    key={option.value}
                    className={`group relative flex cursor-pointer items-center rounded-xl p-6 transition-all duration-300 ${
                      isSelected ? 'bg-white shadow-lg shadow-blue-500/5 ring-2 ring-blue-600/20' : 'bg-white ring-1 ring-slate-200 hover:shadow-lg hover:shadow-blue-500/5'
                    }`}
                  >
                    <input checked={isSelected} className="h-5 w-5 border-slate-300 text-blue-600 focus:ring-blue-500/20" name="payment" type="radio" onChange={() => setForm((prev) => ({ ...prev, paymentMethod: option.value }))} />
                    <div className="ml-4 flex items-center gap-4">
                      <Icon className={option.iconClassName} size={22} strokeWidth={2} />
                      <div>
                        <p className="font-semibold text-slate-900">{option.title}</p>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-32 lg:col-span-5">
          <div className="rounded-xl bg-slate-100 p-8 shadow-sm">
            <h3 className="mb-8 text-xl font-bold tracking-tight text-slate-900">Tóm tắt đơn hàng</h3>

            <div className="mb-8 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-slate-200 shadow-sm">
                    {item.image ? <img alt={item.title} className="h-full w-full object-cover" src={item.image} /> : <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-500">No image</div>}
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-500">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-blue-700">{formatCurrency((Number(item.unitPrice) || 0) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8 flex gap-2">
              <input className="flex-1 rounded-xl border-none bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Mã giảm giá" type="text" value={form.couponCode} onChange={(event) => setForm((prev) => ({ ...prev, couponCode: event.target.value }))} />
              <button className="rounded-xl bg-slate-300 px-6 text-sm font-semibold text-slate-700 transition-all hover:opacity-80" type="button" onClick={() => toast.info('Chức năng mã giảm giá chưa được triển khai.')}>
                Áp dụng
              </button>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phí vận chuyển</span>
                <span className="font-medium text-blue-700">Miễn phí</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Giảm giá</span>
                <span className="font-medium text-red-500">{`-${formatCurrency(discount)}`}</span>
              </div>
              <div className="flex items-end justify-between pt-4">
                <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                <div className="text-right">
                  <p className="text-2xl font-extrabold tracking-tight text-blue-700">{formatCurrency(total)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Đã bao gồm VAT</p>
                </div>
              </div>
            </div>

            <button className="mt-10 w-full rounded-xl bg-blue-700 py-4 text-lg font-bold text-white shadow-xl shadow-blue-700/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} onClick={handleSubmit} type="button">
              {loading ? 'Đang xử lý...' : form.paymentMethod === 'COD' ? 'Xác nhận đặt hàng' : 'Xác nhận và nhận QR chuyển khoản'}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
              <Lock size={14} strokeWidth={2.25} />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Thanh toán bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
