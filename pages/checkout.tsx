import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { placeOrder, saveOrder } from "@/util/saveOrder";
import { useRouter } from "next/router";
import Head from "next/head";
import { getStateCode } from "@/util/getStateCode";
import { nigerianStates } from "@/data/nigerianStates";
import { useIsClient } from "@/hooks/useIsClient";
import Link from "next/link";
import { validateStockAvailability } from "@/util/saveOrder";
import { Loading } from "@/components/Loading";
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebaseConfig";
import { payWithPaystack, PaystackResponse } from "@/util/paystack";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();
  const [ShippingCost, setShippingCost] = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    paymentMethod: "paystack",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRestoredForm, setHasRestoredForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const isClient = useIsClient();
  const Subtotal =
    total +
    (form.paymentMethod === "pay on delivery"
      ? ShippingCost
      : total <= 100000
      ? ShippingCost
      : 0);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  useEffect(() => {
    if (!hasRestoredForm) {
      const savedForm = localStorage.getItem("checkoutForm");
      if (savedForm) {
        setForm(JSON.parse(savedForm));
      }
      setHasRestoredForm(true);
    }
  }, [hasRestoredForm]);

  // Save form to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return;
    if (hasRestoredForm) {
      localStorage.setItem("checkoutForm", JSON.stringify(form));
    }
  }, [form, hasRestoredForm, isClient]);

  useEffect(() => {
    setShippingCost(getStateCode(selectedState));
  }, [form.paymentMethod]);

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
    setShippingCost(
      form.paymentMethod === "pay on delivery"
        ? getStateCode(state)
        : total <= 100000
        ? getStateCode(state)
        : 0
    );

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
    if (!form.paymentMethod) newErrors.paymentMethod = true;
    if (!form.city) newErrors.city = true;
    setErrors(newErrors);
    console.log("Errors:", newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const orderData = {
    orderNumber: `${Date.now()}`,
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
      city: form.city,
      selectedState,
    },
    paymentMethod: form.paymentMethod,
    total,
    ShippingCost,
    Subtotal,
  };
  /*paystack transaction */
  const verifyTransaction = async (response: PaystackResponse) => {
    try {
      setLoading(true);

      // Call Firebase Cloud Function to verify payment
      const verifyPayment = httpsCallable(functions, "verifyPayment");
      const result: any = await verifyPayment({
        reference: response.reference,
      });
      if (result.data.success && result.data.status === "success") {
        // Payment verified successfully - now place the order
        const success = await placeOrder(
          cart,
          { ...orderData, orderNumber: result.data.reference },
          setLoading,
          setError
        );

        if (success) {
          localStorage.removeItem("checkoutForm");
          router.push(
            `/payment-success/success?orderNumber=${result.data.reference}`
          );
          clearCart();
        } else {
          await saveOrder(
            {
              ...orderData,
              paymentMethod: "Failed to submit",
              orderNumber: result.data.reference,
            },
            setLoading,
            setError
          );
          router.push(
            `/payment-success/payment-success-pending?reference=${result.data.reference}`
          );

          setError(
            `Order placement failed after successful payment. Please contact support with your reference number: ${result.data.reference}`
          );
        }
      } else {
        setError("Payment verification failed. Please contact support.");
      }
    } catch (verificationError) {
      console.error("Verification error:", verificationError);
      setError("Payment verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      setError("Please fill out all required fields correctly.");
      return;
    }
    setError("");
    try {
      await validateStockAvailability(cart);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      payWithPaystack({
        email: form.email,
        amount: Subtotal * 100,
        reference: `${Date.now()}`,
        metadata: {
          firstname: form.firstname,
          lastname: form.lastname,
          phone: form.phone,
        },
        onSuccess: (response) => {
          verifyTransaction(response);
        },
        onClose: () => {
          console.log("Payment cancelled");
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      setError("Please fill out all required fields correctly.");
      return;
    }
    setError("");
    try {
      await validateStockAvailability(cart);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const success = await placeOrder(cart, orderData, setLoading, setError);
      if (success) {
        localStorage.removeItem("checkoutForm");
        router.push(
          `/payment-success/success?orderNumber=${orderData.orderNumber}`
        );
        clearCart();
      }
      setLoading(false);
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };
  // Order summary component
  const OrderSummary = () => (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <ShoppingBag className="w-5 h-5 mr-3 text-blue-600" />
          Order Summary
        </h2>

        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <Link
              href={`/product/${item.slug}`}
              key={`${item.id}-${item.selectedSize}`}
            >
              <div className="grid grid-cols-3 p-4 mb-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 mb-1">{item.name}</p>
                  <p className="text-sm text-slate-600 flex-1">
                    Size {item.selectedSize} × {item.qty}
                  </p>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatPrice(item.price * item.qty)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className=" space-y-3 pt-4 border-t border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>
              {form.paymentMethod === "pay on delivery"
                ? formatPrice(ShippingCost)
                : total <= 100000
                ? formatPrice(ShippingCost)
                : formatPrice(0)}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
            <span>Total</span>
            <span>{formatPrice(Subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isClient) return null;

  return (
    <>
      <Head>
        <title>Checkout - DTwears</title>
        <meta name="description" content="Checkout your cart" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

        <main className="relative max-w-5xl mx-auto px-4 py-8 lg:py-12">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                <ShoppingBag className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-slate-600 mb-8">
                Add some items to your cart to continue shopping
              </p>
              <Link
                href="/productslist"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Order Summary */}

              <div className="lg:col-span-2 hidden lg:block space-y-6">
                <OrderSummary />
              </div>
              {/* Checkout Form */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Customer Information */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50">
                    <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                      <User className="w-5 h-5 mr-3 text-blue-600" />
                      Customer Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="firstname"
                            placeholder="Enter your first name"
                            value={form.firstname}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              errors.firstname
                                ? "border-red-300 bg-red-50 focus:border-red-500"
                                : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500"
                            }`}
                          />
                          {errors.firstname && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="lastname"
                            placeholder="Enter your last name"
                            value={form.lastname}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              errors.lastname
                                ? "border-red-300 bg-red-50 focus:border-red-500"
                                : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500"
                            }`}
                          />
                          {errors.lastname && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={form.phone}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              errors.phone
                                ? "border-red-300 bg-red-50 focus:border-red-500"
                                : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500"
                            }`}
                          />
                          {errors.phone && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              errors.email
                                ? "border-red-300 bg-red-50 focus:border-red-500"
                                : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500"
                            }`}
                          />
                          {errors.email && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Shipping Information */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50">
                    <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                      Shipping Information
                    </h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Shipping Address{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="address"
                            placeholder="Enter your complete shipping address"
                            value={form.address}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${
                              errors.address
                                ? "border-red-300 bg-red-50 focus:border-red-500"
                                : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500"
                            }`}
                          />
                          {errors.address && (
                            <div className="absolute top-4 right-0 flex items-center pr-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="city"
                            placeholder="Enter your city"
                            value={form.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              errors.city
                                ? "border-red-300 bg-red-50 focus:border-red-500"
                                : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500"
                            }`}
                          />
                          {errors.city && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedState}
                          onChange={handleStateChange}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                            errors.state
                              ? "border-red-300 bg-red-50 focus:border-red-500"
                              : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500"
                          }`}
                        >
                          <option value="" disabled>
                            Select your state
                          </option>
                          {nigerianStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* shipping method for mobile */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50 md:hidden block">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Shipping
                    </h2>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Flat rate of{" "}
                          <span className="font-medium">₦5,000.00</span> applies
                          for delivery outside Lagos state.
                        </span>
                      </li>

                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Rate of <span className="font-medium">₦3,000.00</span>{" "}
                          applies within Lagos state.
                        </span>
                      </li>

                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Free shipping on orders above{" "}
                          <span className="font-medium">₦100,000.00</span>. This
                          does not apply if paying on delivery.
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:hidden">
                    <OrderSummary />
                  </div>
                  {/* shipping method for desktop */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border hidden md:block border-slate-200/50 ">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Shipping
                    </h2>

                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Flat rate of{" "}
                          <span className="font-medium">₦5,000.00</span> applies
                          for delivery outside Lagos state.
                        </span>
                      </li>

                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Rate of <span className="font-medium">₦3,000.00</span>{" "}
                          applies within Lagos state.
                        </span>
                      </li>

                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Free shipping on orders above{" "}
                          <span className="font-medium">₦100,000.00</span>. This
                          does not apply if paying on delivery.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                      Payment Method
                    </h3>
                    <p className="text-slate-600 mb-6">
                      All transactions are secure and encrypted.
                    </p>

                    <div className="space-y-4">
                      {/* Paystack Option */}
                      <label
                        className={`relative block cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                          form.paymentMethod === "paystack"
                            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="paystack"
                                checked={form.paymentMethod === "paystack"}
                                onChange={handleChange}
                                className="w-3 h-3 text-blue-600 border-slate-300 focus:ring-blue-500"
                              />
                              <p className="font-semibold text-slate-900">
                                Paystack
                              </p>
                            </div>
                            <Image
                              src="/paystack.png"
                              alt="Paystack"
                              width={150}
                              height={50}
                            />
                          </div>
                        </div>
                      </label>
                      {form.paymentMethod === "paystack" && (
                        <div className="mt-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <p className="text-sm text-slate-600">
                            Pay with card, bank transfer, or USSD
                          </p>
                        </div>
                      )}
                      {/* Bank Transfer Option */}
                      <label
                        className={`relative block cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                          form.paymentMethod === "bank"
                            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-4">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="bank"
                              checked={form.paymentMethod === "bank"}
                              onChange={handleChange}
                              className="w-3 h-3 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  Bank Transfer
                                </p>
                                {/* <p className="text-sm text-slate-600">
                                  Direct bank transfer
                                </p> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                      {/* Bank Details (shown when bank transfer is selected) */}

                      {form.paymentMethod === "bank" && (
                        <div className="mt-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <div className="flex items-center mb-4">
                            <p className="font-semibold text-slate-900">
                              Complete your transfer with these details:
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                Account Name
                              </p>
                              <p className="font-semibold text-slate-900">
                                Adeyeye Damilola Caroline
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                Account Number
                              </p>
                              <p className="font-semibold text-slate-900">
                                3156850684
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                Bank Name
                              </p>
                              <p className="font-semibold text-slate-900">
                                First Bank
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                            <p className="text-sm text-blue-800">
                              All orders will be processed immediately after
                              your payment is confirmed. Please include your
                              order ID as reference for easy confirmation of
                              your payment.
                            </p>
                          </div>
                        </div>
                      )}
                      <label
                        className={`relative block cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                          form.paymentMethod === "pay on delivery"
                            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-4">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="pay on delivery"
                              checked={form.paymentMethod === "pay on delivery"}
                              onChange={handleChange}
                              className="w-3 h-3 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  Pay on Delivery (POD)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>

                      {form.paymentMethod === "pay on delivery" && (
                        <div className="mt-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-800 space-y-4">
                              <p>
                                1. Payment on delivery is only available for
                                Lagos state only.
                              </p>
                              <p>
                                {" "}
                                2. We reserve the right to decline POD order
                                based on location and order value.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <p className="text-red-800 font-medium">{error}</p>
                      </div>
                    </div>
                  )}
                  {/* Submit Button */}
                  {["pay on delivery", "bank"].includes(form.paymentMethod) && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative bg-gradient-to-r rounded-xl cursor-pointer from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-8 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
                      >
                        <span
                          className={`flex items-center justify-center gap-2 ${
                            loading ? "invisible" : ""
                          }`}
                        >
                          <Lock size={15} /> Place Order
                        </span>
                        {loading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loading />
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </form>
                {/* Paystack submit button */}
                {form.paymentMethod === "paystack" && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50 mt-6">
                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full relative bg-gradient-to-r rounded-xl cursor-pointer from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-8 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      <span
                        className={`flex items-center justify-center gap-2 ${
                          loading ? "invisible" : ""
                        }`}
                      >
                        <Lock size={15} /> Place Order
                      </span>
                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loading />
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
