import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order; // passed from checkout

  useEffect(() => {
    if (!order) {
      navigate("/"); // if no order data, redirect home
    }
  }, [order, navigate]);

  if (!order) return null;

  const { items, totalAmount, paymentMethod, address } = order;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-6 text-center border-2 border-green-600">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-green-700">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600">
          Your order has been placed and is being processed.
        </p>

        {/* Order Summary */}
        <div className="bg-green-50 p-4 rounded space-y-2 border border-green-200">
          <h2 className="font-semibold text-green-700 text-lg">
            Order Summary
          </h2>
          {items.map((item) => (
            <div key={item.cartItemId} className="flex justify-between text-sm">
              <p>
                {item.productName} ({item.variant.label}) × {item.quantity}
              </p>
              <p>₹{item.itemTotal}</p>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-semibold text-green-700">
            <p>Total Amount</p>
            <p>₹{totalAmount}</p>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Payment Method: <span className="font-medium">{paymentMethod}</span>
          </p>
          <p className="text-sm text-gray-600">
            Delivery Address:{" "}
            <span className="font-medium">
              {address.address_line}, {address.city}, {address.state} -{" "}
              {address.pincode}
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition"
          >
            Track Your Order
          </button>
          <button
            onClick={() => navigate("/")}
            className="border border-green-600 text-green-600 py-2 rounded font-medium hover:bg-green-50 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
