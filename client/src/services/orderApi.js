import axios from "../api/axios";

export const createOrder = (payload) => axios.post("/order/create", payload);

export const getMyOrders = () => axios.get("/order/my-orders");

export const getOrderDetails = (orderId) => axios.get(`/order/${orderId}`);

export const getAdminOrders = async () => {
  return await axios.get("/order/admin/all"); // adjust endpoint if needed
};
