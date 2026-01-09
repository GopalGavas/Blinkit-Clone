/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addToCart,
  updateCartQty,
  removeCartItem,
  clearCart,
} from "../services/cartApi";
import { errorToast } from "../utils/toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const lastUserIdRef = useRef(null);

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res.data?.success) {
        setItems(res.data.data.items || []);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to fetch cart");
      setItems([]);
    }
  };

  /* ================= AUTH SYNC ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      lastUserIdRef.current = null;
      return;
    }

    if (user?._id && lastUserIdRef.current !== user._id) {
      lastUserIdRef.current = user._id;
      setItems([]);
      fetchCart();
    }
  }, [isAuthenticated, user?._id]);

  /* ================= ADD ITEM ================= */
  const addItem = async ({ productId, variantId, quantity = 1 }) => {
    try {
      const res = await addToCart({ productId, variantId, quantity });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Add to cart failed");
      }

      // IMPORTANT: sync with backend formatted data
      await fetchCart();
    } catch (err) {
      errorToast(err.response?.data?.message || "Add to  cart failed");
      throw err;
    }
  };

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (cartItemId, quantity) => {
    if (!cartItemId) return;

    const prevItems = [...items];

    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );

    try {
      const res = await updateCartQty({ cartItemId, quantity });
      if (!res.data?.success) throw new Error("Update failed");
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to update quantity");
      setItems(prevItems); // rollback
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (cartItemId) => {
    if (!cartItemId) return;

    const prevItems = [...items];
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

    try {
      const res = await removeCartItem(cartItemId);
      if (!res.data?.success) throw new Error("Remove failed");
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to remove item");
      setItems(prevItems); // rollback
    }
  };

  /* ================= CLEAR CART ================= */
  const clearAll = async () => {
    try {
      await clearCart();
      setItems([]);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to clear cart");
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearAll,
        fetchCart,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};
