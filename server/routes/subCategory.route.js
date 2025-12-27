import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createSubCategoryController,
  deleteSubCategoryController,
  getSubCategoryController,
  updateSubCategoryController,
} from "../controllers/subCategory.controller.js";
import { adminOnly } from "../middleware/Admin.js";

const subCategoryRouter = Router();

subCategoryRouter.post("/create", auth, adminOnly, createSubCategoryController);
subCategoryRouter.get("/get", getSubCategoryController);
subCategoryRouter.put(
  "/update/:subCategoryId",
  auth,
  adminOnly,
  updateSubCategoryController
);
subCategoryRouter.delete(
  "/delete/:subCategoryId",
  auth,
  adminOnly,
  deleteSubCategoryController
);

export default subCategoryRouter;
