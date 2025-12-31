/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { getCart, updateCartQty, removeCartItem } from "../services/cartApi";

const CartContext = createContext();

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
      console.error("Failed to fetch cart", err);
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

  /* ================= UPDATE QTY (STEPPER) ================= */

  const updateQuantity = async (cartItemId, quantity) => {
    if (!cartItemId) return;

    const prevItems = [...items];

    // Use cartItemId, not _id
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );

    try {
      const res = await updateCartQty({ cartItemId, quantity });
      if (!res.data?.success) {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Failed to update quantity", err);
      setItems(prevItems); // rollback
    }
  };

  /* ================= REMOVE ITEM ================= */

  const removeItem = async (cartItemId) => {
    const prevItems = [...items];

    setItems((prev) => prev.filter((item) => item._id !== cartItemId));

    try {
      await removeCartItem(cartItemId);
    } catch (err) {
      console.error("Failed to remove item", err);
      setItems(prevItems); // rollback
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        updateQuantity,
        removeItem,
        totalQuantity,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
