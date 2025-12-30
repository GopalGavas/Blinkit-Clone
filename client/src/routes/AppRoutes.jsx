import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import AdminLayout from "../components/AdminLayout";
import CategoryAdmin from "../pages/admin/CategoryAdmin";
import SubCategoryAdmin from "../pages/admin/SubcategoryAdmin";
import ProductAdmin from "../pages/admin/ProductAdmin";
import ProductForm from "../pages/admin/ProductForm";
import Profile from "../pages/Profile";
import SubcategoryPage from "../pages/SubCategoryPage";
import SingleProduct from "../pages/SingleProduct";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="categories" element={<CategoryAdmin />} />
        <Route path="subcategories" element={<SubCategoryAdmin />} />
        <Route path="products" element={<ProductAdmin />} />
        <Route path="products/create" element={<ProductForm />} />
      </Route>
      <Route path="/profile" element={<Profile />} />
      <Route path="/subcategory/:categoryId" element={<SubcategoryPage />} />
      <Route path="/product/:slug" element={<SingleProduct />} />
    </Routes>
  );
};

export default AppRoutes;
