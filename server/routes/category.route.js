import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryController,
  updateCategoryController,
} from "../controllers/category.controller.js";
import { adminOnly } from "../middleware/Admin.js";

const categoryRouter = Router();

categoryRouter.post("/add-category", auth, adminOnly, createCategoryController);
categoryRouter.get("/", getCategoryController);
categoryRouter.put("/:categoryId", auth, adminOnly, updateCategoryController);
categoryRouter.delete(
  "/:categoryId",
  auth,
  adminOnly,
  deleteCategoryController
);

export default categoryRouter;
