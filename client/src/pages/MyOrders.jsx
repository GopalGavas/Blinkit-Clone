import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../services/orderApi";

const statusStyles = {
  PLACED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-yellow-100 text-yellow-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return <p className="text-center mt-10">You have no orders yet</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.map((order) => {
        const firstItem = order.items[0];
        const extraItemsCount = order.items.length - 1;

        return (
          <div
            key={order._id}
            onClick={() => navigate(`/orders/${order._id}`)}
            className="bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer p-5"
          >
            {/* TOP */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  Order #{order._id.slice(-6)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  statusStyles[order.orderStatus] || "bg-gray-100 text-gray-700"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            {/* ITEMS */}
            <div className="flex gap-4 mt-4">
              <img
                src={firstItem.image}
                alt={firstItem.name}
                className="w-16 h-16 object-cover rounded-lg border"
              />

              <div className="flex-1">
                <p className="font-medium text-gray-900 line-clamp-1">
                  {firstItem.name}
                </p>

                <p className="text-sm text-gray-500">
                  {firstItem.variantLabel} × {firstItem.quantity}
                </p>

                {extraItemsCount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    + {extraItemsCount} more item
                    {extraItemsCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* PRICE */}
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ₹{order.finalAmount}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyOrders;
