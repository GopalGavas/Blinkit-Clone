// CartDrawer.jsx
import { useCart } from "../context/CartContext";
import CartItem from "./CartItem"; // single, fixed version

const CartDrawer = ({ open, onClose }) => {
  const { items, updateQuantity, removeItem } = useCart();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[360px] bg-white z-50 shadow-lg flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">My Cart</h2>
          <button onClick={onClose} className="text-xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              Your cart is empty
            </p>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.cartItemId} // use cartItemId as key
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t">
            <button className="w-full bg-green-600 text-white py-2 rounded">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
