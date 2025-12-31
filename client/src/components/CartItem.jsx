// CartItem.jsx
const CartItem = ({ item, updateQuantity, removeItem }) => {
  if (!item) return null;

  const { cartItemId, productName, productImage, variant, quantity } = item;
  const maxStock = variant?.stock ?? Infinity;

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeItem(cartItemId);
    } else {
      updateQuantity(cartItemId, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxStock) {
      updateQuantity(cartItemId, quantity + 1);
    }
  };

  return (
    <div className="flex gap-3 border rounded p-2">
      <img
        src={productImage}
        alt={productName}
        className="w-16 h-16 object-contain bg-gray-100 rounded"
      />

      <div className="flex-1">
        <p className="text-sm font-medium line-clamp-2">{productName}</p>
        <p className="text-xs text-gray-500">{variant?.label}</p>

        <div className="flex justify-between items-center mt-2">
          <span className="font-semibold text-sm">₹{variant?.price}</span>

          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <button onClick={handleDecrease} className="text-lg font-bold px-1">
              −
            </button>
            <span className="text-sm w-4 text-center">{quantity}</span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= maxStock}
              className={`text-lg font-bold px-1 ${
                quantity >= maxStock ? "text-gray-300 cursor-not-allowed" : ""
              }`}
            >
              +
            </button>
          </div>
        </div>

        {quantity >= maxStock && (
          <p className="text-xs text-red-500 mt-1">Max stock reached</p>
        )}
      </div>
    </div>
  );
};

export default CartItem;
