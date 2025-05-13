import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { saveOrder } from "@/util/saveOrder";
import { useRouter } from "next/router";
import { payWithPaystack } from "@/util/paystack";
import Head from "next/head";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "bank",
  });
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const orderData = {
    orderNumber,
    items: cart.map(({ id, name, qty, price, selectedSize }) => ({
      productId: id,
      name,
      qty,
      price,
      selectedSize,
    })),
    customer: {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
    },
    paymentMethod: form.paymentMethod,
    total,
    // createdAt: Timestamp.now(),
  };

  // Check localStorage for order number
  useEffect(() => {
    const existing = localStorage.getItem("orderNumber");
    if (existing) {
      setOrderNumber(existing);
    } else {
      const random = Math.floor(100000 + Math.random() * 900000);
      const date = new Date().getTime().toString().slice(-4);
      const newOrder = `ORD-${date}-${random}`;
      localStorage.setItem("orderNumber", newOrder);
      setOrderNumber(newOrder);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name || !form.email || !form.address || !form.phone)
      return "All fields are required.";
    if (!emailRegex.test(form.email))
      return "Please enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    await saveOrder(orderData, setLoading, setError);
    clearCart();
    router.push(`/success/orderNumber=${orderNumber}`);
    localStorage.removeItem("orderNumber");
  };
  const handlePay = async () => {
    const reference =
      localStorage.getItem("orderNumber") || "ORD-" + Date.now();
    if (!localStorage.getItem("orderNumber")) {
      localStorage.setItem("orderNumber", reference);
      setOrderNumber(reference);
    }

    payWithPaystack({
      email: form.email,
      amount: total * 100,
      reference,
      metadata: {
        name: form.name,
        phone: form.phone,
      },
      onSuccess: async (response) => {
        console.log("Payment successful!");
        setLoading(true);
        await saveOrder(
          {
            ...orderData,
          },
          setLoading,
          setError
        );
        clearCart();
        router.push(`/success?orderNumber=${reference}`);
        localStorage.removeItem("orderNumber");
      },
      onClose: () => {
        console.log("Payment popup closed.");
      },
    });
  };

  return (
    <>
      <Head>
        <title>Checkout</title>
      </Head>
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="mb-6 space-y-2">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className="flex justify-between"
                >
                  <p>
                    {item.name} (Size {item.selectedSize}) x {item.qty}
                  </p>
                  <p>${item.price * item.qty}</p>
                </div>
              ))}
              <div className="font-semibold flex justify-between pt-4 border-t">
                <p>Total:</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="number"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
              <textarea
                name="address"
                placeholder="Shipping Address"
                value={form.address}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />

              <div>
                <p className="font-semibold mb-1">Payment Method:</p>
                <label className="inline-flex items-center mr-6">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={form.paymentMethod === "bank"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Bank Transfer
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={form.paymentMethod === "card"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Card Payment
                </label>
              </div>

              {form.paymentMethod === "bank" && (
                <div className="bg-yellow-50 text-yellow-800 border border-yellow-300 p-4 rounded text-sm">
                  Please include your order number{" "}
                  <strong>{orderNumber}</strong> in your bank transfer
                  reference.
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {form.paymentMethod === "bank" && (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              )}
            </form>
            {form.paymentMethod === "card" && (
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 mt-4 py-3 rounded-lg shadow-md transition duration-300"
                onClick={handlePay}
              >
                Pay with Paystack
              </button>
            )}
          </>
        )}
      </main>
    </>
  );
}
