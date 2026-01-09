import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import AdminLayout from "../components/AdminLayout";
import CategoryAdmin from "../pages/admin/CategoryAdmin";
import SubCategoryAdmin from "../pages/admin/SubCategoryAdmin";
import ProductAdmin from "../pages/admin/ProductAdmin";
import ProductForm from "../pages/admin/ProductForm";
import Profile from "../pages/Profile";
import SubcategoryPage from "../pages/SubCategoryPage";
import SingleProduct from "../pages/SingleProduct";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import OrderDetails from "../pages/OrderDetails";
import MyOrders from "../pages/MyOrders";
import AdminOrders from "../pages/admin/AdminOrders";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="categories" element={<CategoryAdmin />} />
        <Route path="subcategories" element={<SubCategoryAdmin />} />
        <Route path="products" element={<ProductAdmin />} />
        <Route path="products/create" element={<ProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>
      <Route path="/profile" element={<Profile />} />
      <Route path="/subcategory/:categoryId" element={<SubcategoryPage />} />
      <Route path="/product/:slug" element={<SingleProduct />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/orders/:orderId" element={<OrderDetails />} />
    </Routes>
  );
};

export default AppRoutes;
