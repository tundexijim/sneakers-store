import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { format } from "date-fns";
import { OrderData } from "@/util/saveOrder";
import { useIsClient } from "@/hooks/useIsClient";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import Link from "next/link";

export interface Order extends OrderData {
  id: string;
  createdAt: Timestamp;
}
export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const isClient = useIsClient();
  const { user, loading: authloading, logOut } = useAuth();
  const router = useRouter();
  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  useEffect(() => {
    if (!authloading && !user) {
      router.push("/admin/login"); // redirect to login/signup if not logged in
    }
  }, [user, authloading]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        setOrders(fetchedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const deleteOrder = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      await deleteDoc(doc(db, "orders", id));
      setOrders((prev) => prev.filter((order) => order.id !== id));
    }
  };
  if (!isClient) return null;
  if (user?.email !== "ijimakindetunde@gmail.com") return null;

  if (loading) return <p className="text-center py-10">Loading orders...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Admin Orders Panel</h1>
        <Link href="/admin/add-product">
          <button>Add Product</button>
        </Link>
        <button onClick={logOut}>Log Out</button>
      </div>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <p>Total Orders: {orders.length}</p>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`border p-4 rounded shadow flex justify-between items-center ${
                  order.paymentMethod?.toLowerCase().trim() ===
                  "failed to submit"
                    ? "bg-gray-600"
                    : ""
                }`}
              >
                <div>
                  <p>
                    <span className="font-semibold">Order #:</span>{" "}
                    {order.orderNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Customer:</span>{" "}
                    {order.customer?.firstname ?? "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.createdAt?.seconds &&
                      format(new Date(order.createdAt.seconds * 1000), "PPPpp")}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0  bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full p-6 rounded shadow-lg relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">
              Order #{selectedOrder.orderNumber}
            </h2>
            <p>
              <strong>First Name:</strong> {selectedOrder.customer?.firstname}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedOrder.customer?.lastname}
            </p>
            <p>
              <strong>Email:</strong> {selectedOrder.customer?.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedOrder.customer.phone}
            </p>
            <p>
              <strong>Address:</strong> {selectedOrder.customer.address}
            </p>
            <p>
              <strong>City:</strong> {selectedOrder.customer.city}
            </p>
            <p>
              <strong>State:</strong> {selectedOrder.customer.selectedState}
            </p>
            <p>
              <strong>Payment:</strong> {selectedOrder.paymentMethod}
            </p>
            <p>
              <strong>Total:</strong> {formatPrice(selectedOrder.total)}
            </p>
            <p>
              <strong>Shipping Cost:</strong>{" "}
              {formatPrice(selectedOrder.ShippingCost)}
            </p>
            <p>
              <strong>Subtotal:</strong> {formatPrice(selectedOrder.Subtotal)}
            </p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items:</h3>
              <ul className="space-y-1">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    {item.name} (x{item.qty}) - ₦{item.price} [Size:{" "}
                    {item.selectedSize}]
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
