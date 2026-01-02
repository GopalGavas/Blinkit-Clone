import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { getAdminOrders } from "../../services/orderApi";
import { errorToast } from "../../utils/toast";

const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES = ["PENDING", "PAID"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getAdminOrders();
        if (res.data.success) {
          setOrders(res.data.data.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await axios.patch(`/order/${orderId}/status`, {
        orderStatus,
        paymentStatus,
      });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: orderStatus || order.orderStatus,
                  payment: paymentStatus
                    ? { ...order.payment, status: paymentStatus }
                    : order.payment,
                }
              : order
          )
        );
      }
    } catch (err) {
      console.error("Failed to update order", err);
      errorToast("Failed to update the payment/order status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading orders...</p>;
  }

  if (!orders.length) {
    return <p className="text-center mt-10 text-gray-500">No orders found</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Orders</h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white border border-green-200 rounded-xl shadow hover:shadow-lg transition overflow-hidden"
        >
          {/* ORDER SUMMARY */}
          <div
            onClick={() => toggleExpand(order._id)}
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-green-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-800">
                Order #{order._id.slice(-6)}
              </p>
              <p className="text-sm text-gray-500">
                {order.userId?.name} -{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-800">
                ₹{order.finalAmount}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* EXPANDED DETAILS */}
          {expandedId === order._id && (
            <div className="border-t bg-gray-50 p-5 space-y-5">
              {/* ITEMS */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.productId + item.variantLabel}
                      className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.variantLabel} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ₹{item.totalPrice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADDRESS */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Delivery Address
                </h3>
                <p className="text-gray-700">
                  {order.addressSnapshot.address_line}
                </p>
                <p className="text-sm text-gray-500">
                  {order.addressSnapshot.city}, {order.addressSnapshot.state} -{" "}
                  {order.addressSnapshot.pincode}
                </p>
              </div>

              {/* PAYMENT */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-700">
                  Payment Method:{" "}
                  <span className="font-medium text-gray-800">
                    {order.payment.method}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  Status:{" "}
                  <span className="font-medium text-gray-800">
                    {order.payment.status}
                  </span>
                </p>
              </div>

              {/* STATUS & PAYMENT UPDATE */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Order Status:</label>
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={order.orderStatus}
                    disabled={updatingId === order._id}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COD payment update */}
                {order.payment.method === "COD" && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">
                      Payment Status:
                    </label>
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={order.payment.status}
                      disabled={updatingId === order._id}
                      onChange={(e) =>
                        updateOrderStatus(
                          order._id,
                          order.orderStatus,
                          e.target.value
                        )
                      }
                    >
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {updatingId === order._id && (
                  <span className="text-xs text-gray-500">Updating...</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Utility function for badge color
function getStatusBadgeColor(status) {
  switch (status) {
    case "PLACED":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "PACKED":
      return "bg-purple-100 text-purple-700";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-100 text-orange-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default AdminOrders;
