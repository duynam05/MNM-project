import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart } from 'lucide-react';
import { buildApiUrl, resolveImageUrl } from '../config/api';
import { useCartActions } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const BookCard = ({ book }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setCart, addToCartSuccess } = useCartActions();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const stock = book.stock ?? 0;

  const isOutOfStock = stock === 0;

  const increaseQty = () => {
    if (quantity >= stock) {
      toast.error(`Không thể vượt quá ${stock} sản phẩm trong kho`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };
  
  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
  
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      navigate('/login');
      return;
    }

    if (isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm trong kho`);
      return;
    }
  
    if (loading) return;
    setLoading(true);
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(buildApiUrl('/cart'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: book.id,
          quantity
        })
      });
      
      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        const msg =
          data?.message ||
          (res.status === 400
            ? "Số lượng vượt quá tồn kho"
            : res.status === 401
            ? "Phiên đăng nhập hết hạn"
            : "Có lỗi xảy ra");
      
        toast.error(msg);
      
        if (res.status === 400) {
          setQuantity(Math.max(stock, 1));
        }
      
        if (res.status === 401) {
          navigate('/login');
        }
      
        return;
      }
  
      // const data = await res.json();
  
      // sync full cart từ server
      setCart(data.result);
  
      setQuantity(1);
  
      addToCartSuccess(`Đã thêm "${book.title}" vào giỏ`);

    } catch (err) {
      console.error(err);
      toast.error("Không thể thêm vào giỏ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quantity > stock) {
      setQuantity(Math.max(stock, 1));
    }
  }, [quantity, stock]);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <Link to={`/book/${book.id}`} className="relative h-64 overflow-hidden group">
        <img
          src={resolveImageUrl(book.image)}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-book.svg';
          }}
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-blue-600 font-semibold uppercase">{book.category}</span>
        <Link to={`/book/${book.id}`} className="text-lg font-bold text-gray-800 hover:text-blue-600 mt-1 line-clamp-1">
          {book.title}
        </Link>
        <p className="text-gray-500 text-sm mb-2">{book.author}</p>

        <div className="mb-2">
          <StarRating rating={book.rating || 0} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
          </span>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">
              Còn {stock}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                decreaseQty();
              }}
              disabled={quantity <= 1}
              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>

            <span className="min-w-[24px] text-center">{quantity}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                increaseQty();
              }}
              disabled={isOutOfStock || quantity >= stock}
              title={
                isOutOfStock
                  ? "Sản phẩm đã hết hàng"
                  : quantity >= stock
                  ? "Đã đạt giới hạn tồn kho"
                  : "Tăng số lượng"
              }
              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={loading || isOutOfStock}
            aria-label="Thêm vào giỏ hàng"
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
          </button>

          {isOutOfStock && (
            <span className="text-red-500 text-xs">Hết hàng</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;