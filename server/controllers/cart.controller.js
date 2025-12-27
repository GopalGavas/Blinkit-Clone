import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";

export const addToCartController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({
        message: "productId and variantId are required",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
        error: true,
        success: false,
      });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        error: true,
        success: false,
      });
    }

    const existingCartItem = await CartModel.findOne({
      userId,
      productId,
      variantId,
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > variant.stock) {
        return res.status(400).json({
          message: "Quantity exceeds available stock",
          error: true,
          success: false,
        });
      }

      existingCartItem.quantity = newQuantity;
      await existingCartItem.save();

      return res.json({
        message: "Cart updated successfully",
        success: true,
        error: false,
        data: existingCartItem,
      });
    }

    const cartItem = await CartModel.create({
      userId,
      productId,
      variantId,
      quantity,
      price: variant.price,
    });

    return res.status(201).json({
      message: "Item added to cart",
      success: true,
      error: false,
      data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const getCartController = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await CartModel.find({ userId })
      .populate({
        path: "productId",
        select: "name images variants",
      })
      .sort({ createdAt: -1 });

    let totalQuantity = 0;
    let totalAmount = 0;

    const formattedCart = cartItems
      .map((item) => {
        const product = item.productId;

        // product deleted safety
        if (!product) return null;

        const variant = product.variants.find(
          (v) => v._id.toString() === item.variantId.toString()
        );

        if (!variant) return null;

        const itemTotal = item.price * item.quantity;

        totalQuantity += item.quantity;
        totalAmount += itemTotal;

        return {
          cartItemId: item._id,
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0] || "",
          variant: {
            variantId: variant._id,
            label: variant.label,
            price: item.price,
          },
          quantity: item.quantity,
          itemTotal,
        };
      })
      .filter(Boolean); // remove nulls

    return res.json({
      message: "Cart data",
      success: true,
      error: false,
      data: {
        items: formattedCart,
        summary: {
          totalItems: formattedCart.length,
          totalQuantity,
          totalAmount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const updateCartQuantityController = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || quantity === undefined) {
      return res.status(400).json({
        message: "cartItemId and quantity are required",
        error: true,
        success: false,
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
        error: true,
        success: false,
      });
    }

    const cartItem = await CartModel.findOne({
      _id: cartItemId,
      userId,
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        error: true,
        success: false,
      });
    }

    // OPTIONAL: Stock validation
    const product = await ProductModel.findById(cartItem.productId);

    const variant = product?.variants?.find(
      (v) => v._id.toString() === cartItem.variantId.toString()
    );

    if (!variant) {
      return res.status(400).json({
        message: "Product variant not available",
        error: true,
        success: false,
      });
    }

    if (quantity > variant.stock) {
      return res.status(400).json({
        message: `Only ${variant.stock} items left in stock`,
        error: true,
        success: false,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.json({
      message: "Cart quantity updated",
      success: true,
      error: false,
      data: {
        cartItemId: cartItem._id,
        quantity: cartItem.quantity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const removeCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItemId } = req.params;

    if (!cartItemId) {
      return res.status(400).json({
        message: "Cart item ID is required",
        error: true,
        success: false,
      });
    }

    const deletedItem = await CartModel.findOneAndDelete({
      _id: cartItemId,
      userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Cart item not found or unauthorized",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Item removed from cart",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const clearCartController = async (req, res) => {
  try {
    const userId = req.userId;

    await CartModel.deleteMany({ userId });

    return res.json({
      message: "Cart cleared successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};
