// context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import * as cartApi from "@/services/cartApi";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setCart(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async ({ productId, variantId, quantity = 1 }) => {
    await cartApi.addToCart({ productId, variantId, quantity });
    fetchCart();
  };

  const updateQty = async (cartItemId, quantity) => {
    await cartApi.updateCartQty({ cartItemId, quantity });
    fetchCart();
  };

  const removeItem = async (cartItemId) => {
    await cartApi.removeCartItem(cartItemId);
    fetchCart();
  };

  const clear = async () => {
    await cartApi.clearCart();
    setCart(null);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
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
