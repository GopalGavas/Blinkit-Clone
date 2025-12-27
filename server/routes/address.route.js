import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  addAddressController,
  deleteAddressController,
  getAddressController,
  updateAddressController,
} from "../controllers/address.controller.js";

const addressRouter = Router();

addressRouter.use(auth);

addressRouter.post("/create", addAddressController);
addressRouter.get("/", getAddressController);
addressRouter.put("/:addressId", updateAddressController);
addressRouter.patch("/:addressId", deleteAddressController);

export default addressRouter;
