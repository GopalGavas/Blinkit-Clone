// services/cartApi.js
import axios from "../api/axios";

export const addToCart = (payload) => axios.post("/cart/create", payload);

export const getCart = () => axios.get("/cart");

export const updateCartQty = (payload) =>
  axios.put("/cart/update-qty", payload);

export const removeCartItem = (cartItemId) =>
  axios.delete(`/cart/remove/${cartItemId}`);

export const clearCart = () => axios.delete("/cart/clear");
