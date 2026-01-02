import { Router } from "express";
import auth from "../middleware/auth.js";
import { adminOnly } from "../middleware/Admin.js";
import {
  createOrderController,
  getAllOrdersAdminController,
  getMyOrdersController,
  getOrderDetailsController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.use(auth);

orderRouter.post("/create", createOrderController);
orderRouter.get("/my-orders", getMyOrdersController);
orderRouter.get("/:orderId", getOrderDetailsController);
orderRouter.patch("/:orderId/status", adminOnly, updateOrderStatusController);
orderRouter.get("/admin/all", adminOnly, getAllOrdersAdminController);

export default orderRouter;
