import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetails } from "../services/orderApi";
import { errorToast } from "../utils/toast";

const statusStyles = {
  PLACED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-yellow-100 text-yellow-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderDetails(orderId);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        errorToast(err.response?.data?.message || "Failed to fetch Orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <p className="text-center mt-10">Loading order...</p>;
  }

  if (!order) {
    return <p className="text-center mt-10">Order not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      {/* SINGLE UNIFIED CARD */}
      <div className="bg-white rounded-2xl shadow border-l-4 border-green-600 overflow-hidden">
        {/* HEADER */}
        <div className="p-5 flex justify-between items-start bg-green-50">
          <div>
            <p className="text-sm text-gray-500">
              Order #{order._id.slice(-6)}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusStyles[order.orderStatus]
            }`}
          >
            {order.orderStatus}
          </span>
        </div>

        {/* ITEMS */}
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Items</h2>

          {order.items.map((item) => (
            <div
              key={item.productId + item.variantLabel}
              className="flex items-center gap-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover border"
              />

              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.variantLabel} × {item.quantity}
                </p>
              </div>

              <p className="font-semibold text-gray-900">₹{item.totalPrice}</p>
            </div>
          ))}
        </div>

        {/* ADDRESS */}
        <div className="px-5 py-4 border-t bg-gray-50">
          <h2 className="font-semibold text-gray-800 mb-1">Delivery Address</h2>
          <p className="text-gray-700 leading-relaxed">
            {order.addressSnapshot.address_line}
          </p>
          <p className="text-sm text-gray-500">
            {order.addressSnapshot.city}, {order.addressSnapshot.state} –{" "}
            {order.addressSnapshot.pincode}
          </p>
        </div>

        {/* PAYMENT + SUMMARY */}
        <div className="px-5 py-4 border-t space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <p>Payment Method</p>
            <p className="font-medium text-gray-800">{order.payment.method}</p>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <p>Delivery Fee</p>
            <p>₹{order.deliveryFee}</p>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <p>Discount</p>
            <p>- ₹{order.discount}</p>
          </div>

          <div className="flex justify-between pt-3 border-t text-lg font-semibold">
            <p>Total</p>
            <p>₹{order.finalAmount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
