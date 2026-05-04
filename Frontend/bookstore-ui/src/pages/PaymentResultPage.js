import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { buildApiUrl } from '../config/api';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value) || 0);
}

function paymentStatusText(order, gatewayStatus) {
  if (order?.paymentStatus === 'PAID') return 'Đã thanh toán';
  if (gatewayStatus === 'PAID') return 'Đã thanh toán, đang đồng bộ';
  if (gatewayStatus === 'PENDING' || order?.paymentStatus === 'PENDING') return 'Đang chờ xác nhận';
  if (gatewayStatus === 'CANCELLED') return 'Đã hủy thanh toán';
  return 'Chưa thanh toán';
}

export default function PaymentResultPage() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const orderId = params.get('orderId') || '';
  const gatewayStatus = params.get('status') || '';
  const gatewayCode = params.get('code') || '';
  const token = localStorage.getItem('token');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !token) {
      setLoading(false);
      return;
    }

    let active = true;
    let attempts = 0;

    const fetchOrder = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/orders/${orderId}/payment-session`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!active) return;
        if (res.ok) {
          setOrder(data.result);
        }
      } finally {
        if (!active) return;
        attempts += 1;
        setLoading(false);

        if (attempts < 12 && gatewayStatus === 'PAID' && (!order || order.paymentStatus !== 'PAID')) {
          setTimeout(fetchOrder, 5000);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [gatewayStatus, order, orderId, token]);

  if (!orderId) {
    return <div className="px-6 py-16 text-center text-slate-500">Thiếu thông tin đơn hàng.</div>;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">payOS</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Kết quả thanh toán</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Trang này nhận kết quả redirect từ payOS. Trạng thái cuối cùng của đơn luôn được xác nhận ở backend qua webhook/IPN.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <span className="text-slate-500">Mã đơn hàng</span>
            <span className="font-semibold text-slate-900">#{orderId.slice(0, 8)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <span className="text-slate-500">Trạng thái từ payOS</span>
            <span className="font-semibold text-slate-900">{gatewayStatus || '--'}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <span className="text-slate-500">Mã phản hồi</span>
            <span className="font-semibold text-slate-900">{gatewayCode || '--'}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <span className="text-slate-500">Trạng thái hệ thống</span>
            <span className="font-semibold text-blue-700">{paymentStatusText(order, gatewayStatus)}</span>
          </div>
          {order ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Tổng thanh toán</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.totalPrice)}</span>
            </div>
          ) : null}
        </div>

        {loading ? <p className="mt-6 text-sm text-slate-500">Đang đồng bộ trạng thái đơn hàng...</p> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800" to={`/account/orders/${orderId}`}>
            Xem chi tiết đơn hàng
          </Link>
          <Link className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50" to="/account/orders">
            Về danh sách đơn hàng
          </Link>
        </div>
      </div>
    </main>
  );
}
