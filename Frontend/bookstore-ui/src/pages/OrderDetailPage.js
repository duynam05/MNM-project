import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { buildApiUrl } from '../config/api';

const ORDER_STATUS_VI = {
  PENDING: 'Chờ xử lý',
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const PAYMENT_STATUS_VI = {
  UNPAID: 'Chưa thanh toán',
  PENDING: 'Đang chờ xác nhận',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

const PAYMENT_METHOD_VI = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  ONLINE: 'Thanh toán online',
};

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
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
    expiresAt: session?.expiresAt || '',
    sessionStatus: session?.status || '',
  };
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const token = localStorage.getItem('token');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchOrder = async () => {
      const res = await fetch(buildApiUrl(`/api/orders/${orderId}/payment-session`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setOrder(data.result);
    };

    fetchOrder();
  }, [orderId, token]);

  useEffect(() => {
    if (!token || !orderId || !order) return undefined;
    if (order.paymentMethod !== 'BANK_TRANSFER' || order.paymentStatus === 'PAID' || order.status === 'CANCELLED') {
      return undefined;
    }

    let active = true;

    const pollOrder = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/orders/${orderId}/payment-session`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!active || !res.ok || !data?.result) return;
        setOrder(data.result);
      } catch {
        // Ignore transient polling failures while waiting for payOS sync.
      }
    };

    const intervalId = window.setInterval(pollOrder, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [order, orderId, token]);

  if (!order) return <div className="p-10">Loading...</div>;

  const transferReference = getTransferReference(order);
  const transferInfo = getTransferInfo(order);
  const showBankTransferGuide =
    order.paymentMethod === 'BANK_TRANSFER' &&
    order.paymentStatus !== 'PAID' &&
    order.status !== 'CANCELLED';

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Đơn hàng #{order.orderId.slice(0, 8)}</h1>

      <div className="space-y-2 rounded-2xl bg-white p-4 shadow">
        <p><b>Trạng thái:</b> {ORDER_STATUS_VI[order.status] || order.status}</p>
        <p><b>Thanh toán:</b> {PAYMENT_STATUS_VI[order.paymentStatus] || order.paymentStatus}</p>
        <p><b>Phương thức:</b> {PAYMENT_METHOD_VI[order.paymentMethod] || order.paymentMethod}</p>
        <p><b>Địa chỉ:</b> {order.address}</p>
        <p><b>Tổng tiền:</b> {formatCurrency(order.totalPrice)}</p>
        {transferReference ? <p><b>Mã chuyển khoản:</b> {transferReference}</p> : null}
      </div>

      {showBankTransferGuide ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-blue-900">Hướng dẫn chuyển khoản</h2>
          {transferInfo.qrUrl ? (
            <div className="mt-4 flex justify-center rounded-2xl border border-blue-100 bg-white p-4">
              <img alt="QR chuyển khoản" className="h-auto w-full max-w-[280px]" src={transferInfo.qrUrl} />
            </div>
          ) : null}
          <div className="mt-3 space-y-1">
            <p><b>Ngân hàng:</b> {transferInfo.bankName}</p>
            <p><b>Số tài khoản:</b> {transferInfo.accountNumber}</p>
            <p><b>Chủ tài khoản:</b> {transferInfo.accountHolder}</p>
            <p><b>Nội dung:</b> {transferReference}</p>
            {transferInfo.expiresAt ? <p><b>Hiệu lực:</b> {new Date(transferInfo.expiresAt).toLocaleString('vi-VN')}</p> : null}
            {transferInfo.sessionStatus ? <p><b>Trạng thái phiên:</b> {transferInfo.sessionStatus}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Sản phẩm</h2>
        {order.items?.map((item) => (
          <div key={item.id} className="flex gap-3 border-b py-2 last:border-b-0">
            <img src={item.image} className="h-20 w-16 rounded object-cover" alt={item.title} />
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">SL: {item.quantity}</p>
            </div>
            <div className="font-semibold">{formatCurrency(item.lineTotal || 0)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
