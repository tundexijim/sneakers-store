import { useState, useEffect } from "react";
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
// Removed date-fns import - using native Date formatting
import { OrderData } from "@/util/saveOrder";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Eye,
  Trash2,
  Plus,
  LogOut,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ShoppingCart,
  X,
} from "lucide-react";

export interface Order extends OrderData {
  id: string;
  createdAt: Timestamp;
}

export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const deleteOrder = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setDeleteLoading(true);
      try {
        await deleteDoc(doc(db, "orders", id));
        setOrders((prev) => prev.filter((order) => order.id !== id));
      } catch (error) {
        console.error("Error deleting order:", error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const getStatusColor = (paymentMethod: string) => {
    const method = paymentMethod?.toLowerCase().trim();
    if (method === "failed to submit") return "bg-red-500";
    if (method === "paid") return "bg-green-500";
    return "bg-yellow-500";
  };

  const getStatusText = (paymentMethod: string) => {
    const method = paymentMethod?.toLowerCase().trim();
    if (method === "failed to submit") return "Failed";
    if (method === "paid") return "Paid";
    return "Pending";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!user || user?.email !== process.env.NEXT_PUBLIC_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your orders and products
              </p>
            </div>
            <div className="flex items-center gap-4 flex-col md:flex-row ">
              <Link href="/admin/add-product">
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </Link>
              <button
                onClick={logOut}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Total Orders
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {orders.length}
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              Orders will appear here once customers start placing them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Package className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              order.paymentMethod
                            )}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-600">
                            {getStatusText(order.paymentMethod)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {order.customer?.firstname}{" "}
                            {order.customer?.lastname}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatPrice(order.Subtotal)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">
                            {order.createdAt?.seconds &&
                              new Date(
                                order.createdAt.seconds * 1000
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4 md:flex-row flex-col">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        disabled={deleteLoading}
                        className="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedOrder.customer?.firstname}{" "}
                        {selectedOrder.customer?.lastname}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {selectedOrder.customer?.email}
                      </p>
                      <p>
                        E-mail Opt-In:{" "}
                        {selectedOrder.customer.emailOptIn ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {selectedOrder.customer.phone}
                      </p>
                      <p>
                        Text Opt-In:{" "}
                        {selectedOrder.customer.textOptIn ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium flex items-center">
                        <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                        {selectedOrder.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium flex items-start">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400 mt-0.5" />
                      {selectedOrder.customer.address},{" "}
                      {selectedOrder.customer.city},{" "}
                      {selectedOrder.customer.selectedState}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Order Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {formatPrice(selectedOrder.ShippingCost)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        Subtotal
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(selectedOrder.Subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Size: {item.selectedSize}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₦{item.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
