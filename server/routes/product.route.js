import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createProductController,
  deleteProductController,
  getProductsByCategoryController,
  getProductsByCategoryAndSubController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
} from "../controllers/product.controller.js";
import { adminOnly } from "../middleware/Admin.js";

const productRouter = Router();

productRouter.post("/create", auth, adminOnly, createProductController);
productRouter.get("/", getAllProductsController);
productRouter.get("/category/:categorySlug", getProductsByCategoryController);
productRouter.get(
  "/:categorySlug/:subCategorySlug",
  getProductsByCategoryAndSubController
);
productRouter.get("/:slug", getSingleProductController);

productRouter.put(
  "/update/:productId",
  auth,
  adminOnly,
  updateProductController
);

productRouter.delete(
  "/delete/:productId",
  auth,
  adminOnly,
  deleteProductController
);

export default productRouter;
