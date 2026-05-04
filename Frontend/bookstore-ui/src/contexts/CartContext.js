import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect
} from 'react';
import { buildApiUrl } from '../config/api';
import { toast } from 'react-toastify';

const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    totalPrice: 0
  });

  const resetCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalQuantity: 0,
      totalPrice: 0
    });
  };

  useEffect(() => {
    const handleLogout = () => {
      resetCart();
    };
  
    window.addEventListener("logout", handleLogout);
  
    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  const cartItemCount =
    cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    const fetchCart = useCallback(async () => {
      try {
        const token = localStorage.getItem("token");
    
        if (!token) {
          setCart({
            items: [],
            totalItems: 0,
            totalQuantity: 0,
            totalPrice: 0
          });
          return;
        }
    
        const res = await fetch(buildApiUrl('/cart'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        if (res.status === 401) {
          console.warn("Unauthorized cart");
          setCart({
            items: [],
            totalItems: 0,
            totalQuantity: 0,
            totalPrice: 0
          });
          return;
        }
    
        const data = await res.json();
    
        if (!res.ok) {
          throw new Error(data?.message || "Load cart failed");
        }
    
        setCart(data.result || {
          items: [],
          totalItems: 0,
          totalQuantity: 0,
          totalPrice: 0
        });
    
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải giỏ hàng");
    
        setCart({
          items: [],
          totalItems: 0,
          totalQuantity: 0,
          totalPrice: 0
        });
      }
    }, []);

  // wrapper actions để show toast UI đồng nhất
  const addToCartSuccess = useCallback((msg = "Đã thêm vào giỏ hàng") => {
    toast.success(msg);
  }, []);

  const removeFromCartSuccess = useCallback((msg = "Đã xóa sản phẩm") => {
    toast.info(msg);
  }, []);

  const updateCartSuccess = useCallback((msg = "Đã cập nhật giỏ hàng") => {
    toast.success(msg);
  }, []);

  const stateValue = useMemo(() => ({
    cart,
    cartItemCount
  }), [cart, cartItemCount]);

  const actionsValue = useMemo(() => ({
    setCart,
    fetchCart,
    resetCart,
    addToCartSuccess,
    removeFromCartSuccess,
    updateCartSuccess
  }), [
    fetchCart,
    addToCartSuccess,
    removeFromCartSuccess,
    updateCartSuccess
  ]);

  return (
    <CartStateContext.Provider value={stateValue}>
      <CartActionsContext.Provider value={actionsValue}>
        {children}
      </CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
};

export const useCartState = () => useContext(CartStateContext);
export const useCartActions = () => useContext(CartActionsContext);