import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import AddressModel from "../models/address.model.js";

export const createOrderController = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId, paymentMethod = "COD" } = req.body;

    if (!addressId) {
      return res.status(400).json({
        message: "Address is required",
        error: true,
        success: false,
      });
    }

    // 1️⃣ Fetch cart items
    const cartItems = await CartModel.find({ userId });

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
        error: true,
        success: false,
      });
    }

    // 2️⃣ Fetch address snapshot
    const address = await AddressModel.findOne({
      _id: addressId,
      userId,
      status: true,
    });

    if (!address) {
      return res.status(400).json({
        message: "Invalid address",
        error: true,
        success: false,
      });
    }

    let orderItems = [];
    let totalAmount = 0;

    // 3️⃣ Validate stock & build order items
    for (const item of cartItems) {
      const product = await ProductModel.findById(item.productId);

      if (!product || !product.status) {
        return res.status(400).json({
          message: "Product unavailable",
          error: true,
          success: false,
        });
      }

      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );

      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
          error: true,
          success: false,
        });
      }

      const itemTotal = variant.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        variantId: variant._id,
        variantLabel: variant.label,
        price: variant.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    // 4️⃣ Create order
    const order = await OrderModel.create({
      userId,
      items: orderItems,
      addressSnapshot: {
        address_line: address.address_line,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        mobile: address.mobile,
      },
      payment: {
        method: paymentMethod,
        status: "PENDING",
      },
      totalAmount,
      finalAmount: totalAmount,
    });

    // 5️⃣ Reduce stock
    for (const item of cartItems) {
      await ProductModel.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }

    // 6️⃣ Clear cart
    await CartModel.deleteMany({ userId });

    return res.status(201).json({
      message: "Order placed successfully",
      error: false,
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const getMyOrdersController = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });

    return res.json({
      message: "My orders",
      success: true,
      error: false,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getOrderDetailsController = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Order details",
      success: true,
      error: false,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "CONFIRMED",
      "PACKED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Order status updated",
      success: true,
      error: false,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};
