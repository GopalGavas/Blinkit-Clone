import { createContext, useContext, useEffect, useState } from "react";
import * as cartApi from "../services/cartApi";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      const data = res.data?.data;

      setCartItems(data?.items || []);
      setSummary(data?.summary || {});
    } catch (err) {
      console.error("Fetch cart failed", err);
      setCartItems([]);
      setSummary({ totalItems: 0, totalQuantity: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (payload) => {
    await cartApi.addToCart(payload);
    await fetchCart();
  };

  const updateQty = async (cartItemId, quantity) => {
    await cartApi.updateCartQty({ cartItemId, quantity });
    await fetchCart();
  };

  const removeItem = async (cartItemId) => {
    await cartApi.removeCartItem(cartItemId);
    await fetchCart();
  };

  const clear = async () => {
    await cartApi.clearCart();
    setCartItems([]);
    setSummary({ totalItems: 0, totalQuantity: 0, totalAmount: 0 });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart: cartItems,
        summary,
        totalQuantity: summary.totalQuantity, // ✅ DIRECT FROM BACKEND
        loading,
        addItem,
        updateQty,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
