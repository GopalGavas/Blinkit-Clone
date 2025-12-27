import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  addToCartController,
  removeCartItemController,
  getCartController,
  updateCartQuantityController,
  clearCartController,
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.use(auth);

cartRouter.post("/create", addToCartController);
cartRouter.get("/", getCartController);
cartRouter.put("/update-qty", updateCartQuantityController);
cartRouter.delete("/remove/:cartItemId", removeCartItemController);
cartRouter.delete("/clear", clearCartController);

export default cartRouter;
