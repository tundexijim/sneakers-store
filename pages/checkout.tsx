import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { placeOrder, saveOrder } from "@/util/saveOrder";
import { useRouter } from "next/router";
import { payWithPaystack } from "@/util/paystack";
import Head from "next/head";
import { getStateCode } from "@/util/getStateCode";
import { nigerianStates } from "@/data/nigerianStates";
import toast from "react-hot-toast";
import { useIsClient } from "@/hooks/useIsClient";
import Link from "next/link";
import { validateStockAvailability } from "@/util/saveOrder";
import { saveProduct } from "@/services/productService";

export default function CheckoutPage() {
  const { cart, total, clearCart, updateQty } = useCart();
  const router = useRouter();

  const [ShippingCost, setShippingCost] = useState(0);
  const Subtotal = total + ShippingCost;

  const [selectedState, setSelectedState] = useState("");
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "bank",
  });
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRestoredForm, setHasRestoredForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const isClient = useIsClient();

  useEffect(() => {
    if (!hasRestoredForm) {
      const savedForm = localStorage.getItem("checkoutForm");
      if (savedForm) {
        setForm(JSON.parse(savedForm));
      }
      setHasRestoredForm(true);
    }

    const existingOrder = localStorage.getItem("orderNumber");
    if (existingOrder) {
      setOrderNumber(existingOrder);
    } else {
      const random = Math.floor(100000 + Math.random() * 900000);
      const date = new Date().getTime().toString().slice(-4);
      const newOrder = `ORD-${date}-${random}`;
      localStorage.setItem("orderNumber", newOrder);
      setOrderNumber(newOrder);
    }
  }, [hasRestoredForm]);

  // Save form to localStorage whenever it changes
  useEffect(() => {
    if (hasRestoredForm) {
      localStorage.setItem("checkoutForm", JSON.stringify(form));
    }
  }, [form, hasRestoredForm]);

  //check for cart item quantity
  useEffect(() => {
    if (!isClient) return;
    cart.forEach((item) => {
      const stock =
        item.sizes?.find((s) => s.size === item.selectedSize)?.stock ?? 0;
      if (item.qty > stock) {
        updateQty(item.id, item.selectedSize, stock);
        toast(
          `"${item.name}" (size ${item.selectedSize}) quantity reduced to available stock (${stock}).`,
          {
            icon: "⚠️",
            duration: 5000,
          }
        );
      }
    });
  }, [isClient, cart, updateQty]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [e.target.name]: false,
      }));
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setSelectedState(state);
    setShippingCost(getStateCode(state));
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: false }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstname) newErrors.firstname = true;
    if (!form.lastname) newErrors.lastname = true;
    if (!form.phone) newErrors.phone = true;
    if (!form.email || !emailRegex.test(form.email)) newErrors.email = true;
    if (!form.address) newErrors.address = true;
    if (!selectedState) newErrors.state = true;
    setErrors(newErrors);
    console.log("Errors:", newErrors);

    return Object.keys(newErrors).length === 0;
  };

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
      firstname: form.firstname,
      lastname: form.lastname,
      phone: form.phone,
      email: form.email,
      address: form.address,
      selectedState,
    },
    paymentMethod: form.paymentMethod,
    total,
    ShippingCost,
    Subtotal,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      setError("Please fill out all required fields correctly.");
      return;
    }
    try {
      await validateStockAvailability(cart);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setLoading(true);
    const success = await placeOrder(cart, orderData, setLoading, setError);
    if (success) {
      localStorage.removeItem("orderNumber");
      localStorage.removeItem("checkoutForm");
      router.push(`/payment-success/success?orderNumber=${orderNumber}`);
      clearCart();
    }
    setLoading(false);
  };

  const handlePay = async () => {
    try {
      const isValid = validateForm();
      if (!isValid) {
        setError("Please fill out all required fields correctly.");
        return;
      }
      setLoading(true);
      setError("");

      try {
        await validateStockAvailability(cart);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const random = Math.floor(100000 + Math.random() * 900000);
      const date = new Date().getTime().toString().slice(-4);
      const newOrder = `ORD-${date}-${random}`;
      const reference = newOrder;
      setLoading(false);
      payWithPaystack({
        email: form.email,
        amount: Subtotal * 100,
        reference: reference,
        metadata: {
          firstname: form.firstname,
          lastname: form.lastname,
          phone: form.phone,
        },
        onSuccess: async () => {
          setLoading(true);
          const success = await placeOrder(
            cart,
            { ...orderData, orderNumber: reference },
            setLoading,
            setError
          );
          if (success) {
            localStorage.removeItem("checkoutForm");
            router.push(`/payment-success/success?orderNumber=${orderNumber}`);
            clearCart();
          } else {
            await saveOrder(
              {
                ...orderData,
                paymentMethod: "Error Occured",
                orderNumber: reference,
              },
              setLoading,
              setError
            );
            router.push(
              `/payment-success/payment-success-pending?reference=${reference}`
            );
          }
        },
        onClose: () => {
          console.log("Payment popup closed.");
        },
      });
    } catch (error: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <>
      <Head>
        <title>Checkout - DTwears</title>
      </Head>
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {cart.length === 0 ? (
          <p>
            Your cart is empty.{" "}
            <Link href="/productslist" className="text-blue-500 underline">
              Go shopping
            </Link>
          </p>
        ) : (
          <div>
            {/* Order Summary */}
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
              <p className="flex justify-between">
                Shipping <span>${ShippingCost}</span>
              </p>
              <div className="font-semibold flex justify-between pt-4 border-t">
                <p>Total:</p>
                <p>${Subtotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2 ">
                  <label htmlFor="state" className="font-medium">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    placeholder="First Name"
                    value={form.firstname}
                    onChange={handleChange}
                    className={`border px-4 py-2 rounded ${
                      errors.firstname ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <div className=" flex flex-col gap-2 ">
                  <label htmlFor="state" className="font-medium">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    placeholder="Last Name"
                    value={form.lastname}
                    onChange={handleChange}
                    className={`border px-4 py-2 rounded ${
                      errors.lastname ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="state" className="font-medium">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full border px-4 py-2 rounded ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="state" className="font-medium">
                  E-mail<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full border px-4 py-2 rounded ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="state" className="font-medium">
                  Address<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  placeholder="Shipping Address"
                  value={form.address}
                  onChange={handleChange}
                  className={`w-full border px-4 py-2 rounded ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="state" className="font-medium">
                  State<span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  className={`border px-4 py-2 rounded ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    Select a state
                  </option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="font-semibold mb-1">Payment Method:</p>
                <div className="flex md:items-center md:flex-row md:gap-0 flex-col gap-4 justify-between">
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
                  <img
                    src="/paystack.png"
                    alt="paystack"
                    className="w-[400px]"
                  />
                </div>
              </div>

              {form.paymentMethod === "bank" && (
                <div className="bg-yellow-50 text-yellow-800 border border-yellow-300 p-4 rounded text-sm">
                  Please include your order number{" "}
                  <strong>{orderNumber}</strong> in the bank transfer reference.
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {form.paymentMethod === "bank" ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePay}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 mt-4 py-3 rounded-lg shadow-md transition duration-300"
                >
                  Pay with Paystack
                </button>
              )}
            </form>
          </div>
        )}
      </main>
    </>
  );
}
