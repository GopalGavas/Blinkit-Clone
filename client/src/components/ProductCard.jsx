import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart();

  if (!product) return null;

  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];

  const outOfStock = !defaultVariant || defaultVariant.stock === 0;

  const originalPrice = defaultVariant?.price ?? 0;
  let finalPrice = originalPrice;

  if (defaultVariant?.discount?.type === "PERCENT") {
    finalPrice =
      originalPrice - (originalPrice * defaultVariant.discount.value) / 100;
  }

  if (defaultVariant?.discount?.type === "FLAT") {
    finalPrice = originalPrice - defaultVariant.discount.value;
  }

  finalPrice = Math.max(finalPrice, 0);

  const cartItem = cartItems?.find(
    (item) =>
      item.productId === product._id &&
      item.variant?.variantId === defaultVariant?._id
  );

  return (
    <div
      className="
        bg-white rounded-lg
        p-2 sm:p-3
        shadow-sm hover:shadow-md transition
        flex flex-col cursor-pointer
        border border-gray-200
        h-full
      "
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* IMAGE */}
      <div
        className="
          aspect-square bg-gray-100 rounded
          mb-2 overflow-hidden
        "
      >
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* NAME */}
      <p
        className="
          text-xs sm:text-sm
          font-medium line-clamp-2
          min-h-[2.25rem] sm:min-h-[2.5rem]
        "
      >
        {product.name}
      </p>

      {/* VARIANT LABEL */}
      {defaultVariant?.label && (
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
          {defaultVariant.label}
        </p>
      )}

      {/* PRICE + ACTION */}
      <div
        className="flex items-center justify-between mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-green-600 font-semibold text-xs sm:text-sm">
            ₹{finalPrice}
          </span>

          {finalPrice < originalPrice && (
            <span className="text-[11px] sm:text-xs text-gray-400 line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {outOfStock ? (
          <span className="text-[11px] sm:text-xs text-red-500 font-medium">
            Out of stock
          </span>
        ) : cartItem ? (
          <div className="flex items-center border border-green-600 rounded-full overflow-hidden">
            <button
              className="px-2 sm:px-3 text-green-600 text-sm"
              onClick={() =>
                cartItem.quantity === 1
                  ? removeItem(cartItem.cartItemId)
                  : updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)
              }
            >
              −
            </button>

            <span className="px-1.5 sm:px-2 text-xs sm:text-sm font-medium">
              {cartItem.quantity}
            </span>

            <button
              className="px-2 sm:px-3 text-green-600 text-sm"
              onClick={() =>
                updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)
              }
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              addItem({
                productId: product._id,
                variantId: defaultVariant._id,
                quantity: 1,
              })
            }
            className="
              border border-green-600 text-green-600
              text-[11px] sm:text-xs
              px-3 sm:px-4 py-1
              rounded-full hover:bg-green-50
            "
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
