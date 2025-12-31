import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart();

  if (!product) return null;

  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];

  const outOfStock = !defaultVariant || defaultVariant.stock === 0;

  // 🔍 find cart item by both productId and variantId
  const cartItem = cartItems?.find(
    (item) =>
      item.productId === product._id &&
      item.variant?.variantId === defaultVariant?._id
  );

  return (
    <div
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col cursor-pointer"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* IMAGE */}
      <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* NAME */}
      <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
        {product.name}
      </p>

      {/* PRICE + ACTION */}
      <div
        className="flex items-center justify-between mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-green-600 font-semibold text-sm">
          ₹{defaultVariant?.price ?? "--"}
        </span>

        {outOfStock ? (
          <span className="text-xs text-red-500 font-medium">Out of stock</span>
        ) : cartItem ? (
          /* STEPPER */
          <div className="flex items-center border border-green-600 rounded-full overflow-hidden">
            <button
              className="px-3 text-green-600"
              onClick={() =>
                cartItem.quantity === 1
                  ? removeItem(cartItem.cartItemId)
                  : updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)
              }
            >
              −
            </button>

            <span className="px-2 text-sm font-medium">
              {cartItem.quantity}
            </span>

            <button
              className="px-3 text-green-600"
              onClick={() =>
                updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)
              }
            >
              +
            </button>
          </div>
        ) : (
          /* ADD */
          <button
            onClick={() =>
              addItem({
                productId: product._id,
                variantId: defaultVariant._id,
                quantity: 1,
              })
            }
            className="border border-green-600 text-green-600 text-xs px-4 py-1 rounded-full hover:bg-green-50"
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
