const ProductCard = ({ product, onAdd }) => {
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];

  const outOfStock = !defaultVariant || defaultVariant.stock === 0;

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col">
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

      {/* PRICE + CART */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-green-600 font-semibold text-sm">
          ₹{defaultVariant?.price ?? "--"}
        </span>

        {outOfStock ? (
          <span className="text-xs text-red-500 font-medium">Out of stock</span>
        ) : (
          <button
            onClick={() => onAdd?.(product, defaultVariant)}
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
