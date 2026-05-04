import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { buildApiUrl } from '../config/api';

const STATUS_COLOR = {
  PENDING: 'text-yellow-600',
  PENDING_PAYMENT: 'text-orange-500',
  CONFIRMED: 'text-blue-600',
  SHIPPING: 'text-purple-600',
  COMPLETED: 'text-green-600',
  CANCELLED: 'text-red-600',
};

const ORDER_STATUS_VI = {
  PENDING: 'Chờ xử lý',
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const PAYMENT_METHOD_VI = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  ONLINE: 'Thanh toán online',
};

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

const OrderListPage = () => {
  const token = localStorage.getItem('token');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(buildApiUrl('/api/orders'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setOrders(data.result || []);
    };

    if (token) fetchOrders();
  }, [token]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Đơn hàng của bạn</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.orderId}
            to={`/account/orders/${order.orderId}`}
            className="block rounded-2xl bg-white p-4 shadow transition hover:shadow-md"
          >
            <div className="flex justify-between gap-4">
              <span className="font-semibold">#{order.orderId.slice(0, 8)}</span>

              <span className={STATUS_COLOR[order.status] || 'text-slate-600'}>
                {ORDER_STATUS_VI[order.status] || order.status}
              </span>
            </div>

            <div className="mt-1 text-sm text-gray-600">
              {order.items?.length || 0} sản phẩm • {formatCurrency(order.totalPrice)}
            </div>

            <div className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              {PAYMENT_METHOD_VI[order.paymentMethod] || order.paymentMethod || 'Chưa có phương thức'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrderListPage;
