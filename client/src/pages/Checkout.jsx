import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Axios from "../api/axios";
import { errorToast } from "../utils/toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, clearAll } = useCart(); // live cart from context

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  /* ---------------- FETCH ADDRESSES ---------------- */
  const fetchAddresses = async () => {
    try {
      const res = await Axios.get("/address");
      if (res.data.success) {
        setAddresses(res.data.data || []);

        // auto select default address
        const def = res.data.data.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
      }
    } catch (err) {
      errorToast(err.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      errorToast("Your cart is empty");
      return;
    }

    if (!selectedAddressId) {
      errorToast("Please select a delivery address");
      return;
    }

    try {
      setLoading(true);

      const res = await Axios.post("/order/create", {
        addressId: selectedAddressId,
        paymentMethod, // ✅ FIXED
      });

      if (res.data.success) {
        await clearAll();

        navigate("/order-success", {
          state: {
            order: {
              items: cartItems,
              totalAmount: cartItems.reduce((sum, i) => sum + i.itemTotal, 0),
              paymentMethod, // ✅ FIXED
              address: addresses.find((a) => a._id === selectedAddressId),
              orderId: res.data.data._id,
            },
          },
        });
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- REDIRECT TO ADD NEW ADDRESS ---------------- */
  const handleAddNewAddress = () => {
    navigate("/profile"); // Profile page has AddressSection where user can add new address
  };

  if (!cartItems || cartItems.length === 0)
    return <p className="text-center mt-10">Your cart is empty</p>;

  const subtotal = cartItems.reduce((sum, i) => sum + i.itemTotal, 0);
  const deliveryFee = 0;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* ---------------- SELECT ADDRESS ---------------- */}
      <div className="bg-white p-4 rounded shadow space-y-3 border-l-4 border-green-600">
        <h2 className="font-semibold text-lg mb-2">Select Delivery Address</h2>
        {addresses.map((addr) => (
          <label
            key={addr._id}
            className="flex items-start gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="checkout-address"
              checked={selectedAddressId === addr._id}
              onChange={() => setSelectedAddressId(addr._id)}
            />

            <div>
              <p className="font-medium">{addr.address_line}</p>
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs text-gray-500">
                {addr.country} | {addr.delivery_mobile}
              </p>
              {addr.isDefault && (
                <span className="text-xs text-green-600 font-semibold">
                  Default Address
                </span>
              )}
            </div>
          </label>
        ))}

        <button
          onClick={handleAddNewAddress}
          className="text-blue-600 underline text-sm mt-2"
        >
          Add New Address
        </button>
      </div>

      {/* ---------------- CART SUMMARY ---------------- */}
      <div className="bg-white p-4 rounded shadow space-y-4 border-l-4 border-green-600">
        <h2 className="font-semibold text-lg border-b pb-2 mb-2">
          Order Summary
        </h2>

        {cartItems.map((item) => (
          <div
            key={item.cartItemId}
            className="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-gray-600">
                {item.variant.label} × {item.quantity} @ ₹{item.variant.price}
              </p>
            </div>
            <p className="font-medium">₹{item.itemTotal}</p>
          </div>
        ))}

        {/* SUMMARY */}
        <div className="pt-3 space-y-1">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>₹{subtotal}</p>
          </div>
          <div className="flex justify-between">
            <p>Delivery Fee</p>
            <p>₹{deliveryFee}</p>
          </div>
          <div className="flex justify-between">
            <p>Discount</p>
            <p>₹{discount}</p>
          </div>
          <div className="flex justify-between font-semibold text-lg mt-2">
            <p>Total Amount</p>
            <p>₹{total}</p>
          </div>
        </div>
      </div>

      {/* ---------------- PAYMENT METHOD ---------------- */}
      <div className="bg-white p-4 rounded shadow space-y-3 border-l-4 border-green-600">
        <h2 className="font-semibold text-lg mb-2">Payment Method</h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery (COD)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="ONLINE"
              checked={paymentMethod === "ONLINE"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Online Payment
          </label>
        </div>
      </div>

      {/* ---------------- PLACE ORDER ---------------- */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded text-lg font-medium hover:bg-green-700 transition"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default Checkout;
