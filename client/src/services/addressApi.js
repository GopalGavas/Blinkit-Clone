import axios from "../api/axios";

export const getAddresses = () => axios.get("/address");
export const addAddress = (data) => axios.post("/address/create", data);
export const updateAddress = (id, data) => axios.put(`/address/${id}`, data);
export const deleteAddress = (id) => axios.patch(`/address/${id}`);
export const setDefaultAddress = (id) =>
  axios.put(`/address/${id}`, { isDefault: true });
