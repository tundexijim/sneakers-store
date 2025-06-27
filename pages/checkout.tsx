import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { placeOrder, saveOrder } from "@/util/saveOrder";
import { useRouter } from "next/router";
// import { PaystackButtonComponent } from "@/util/paystack";
import Head from "next/head";
import { getStateCode } from "@/util/getStateCode";
import { nigerianStates } from "@/data/nigerianStates";
import { useIsClient } from "@/hooks/useIsClient";
import Link from "next/link";
import { validateStockAvailability } from "@/util/saveOrder";
import { Loading } from "@/components/Loading";
import {
  Building2,
  ShoppingBag,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
} from "lucide-react";
import Image from "next/image";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebaseConfig";
import { payWithPaystack, PaystackResponse } from "@/util/paystack";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();

  const [ShippingCost, setShippingCost] = useState(0);
  const Subtotal = total + (total <= 75000 ? ShippingCost : 0);

  const [selectedState, setSelectedState] = useState("");
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "paystack",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRestoredForm, setHasRestoredForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const isClient = useIsClient();
  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
    if (!form.paymentMethod) newErrors.paymentMethod = true;
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
      selectedState,
    },
    paymentMethod: form.paymentMethod,
    total,
    ShippingCost,
    Subtotal,
  };
  /*paystack props */
  const initiateTransaction = async (response: PaystackResponse) => {
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
          initiateTransaction(response);
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
    if (form.paymentMethod === "bank" || "pay on delivery") {
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
              <div className="flex items-center p-4 mb-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={60}
                    height={60}
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

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>
              {total <= 75000 ? formatPrice(ShippingCost) : formatPrice(0)}
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
                          <textarea
                            name="address"
                            rows={3}
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
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50 md:hidden block">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Shipping
                    </h3>
                    <p className="text-slate-600 ">
                      Flat rate of {formatPrice(5000)} applies for delivery
                      outside Lagos state. Rate of {formatPrice(3000)} applies
                      within Lagos state.
                    </p>
                  </div>
                  <div className="lg:hidden">
                    <OrderSummary />
                  </div>
                  {/* shipping method for desktop */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50 hidden md:block">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Shipping
                    </h3>
                    <p className="text-slate-600 ">
                      Flat rate of {formatPrice(5000)} applies for delivery
                      outside Lagos state. Rate of {formatPrice(3000)} applies
                      within Lagos state.
                    </p>
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
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="paystack"
                                checked={form.paymentMethod === "paystack"}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                              />

                              <div>
                                <p className="font-semibold text-slate-900">
                                  Paystack
                                </p>
                                <p className="text-sm text-slate-600">
                                  Pay with card, bank transfer, or USSD
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="24"
                                height="24"
                                viewBox="0 0 120 120"
                              >
                                <rect
                                  width="106"
                                  height="4"
                                  x="7"
                                  y="96"
                                  opacity=".35"
                                ></rect>
                                <rect
                                  width="106"
                                  height="72"
                                  x="7"
                                  y="24"
                                  fill="#0075ff"
                                ></rect>
                                <path
                                  d="M77,39c-6.567,0-12.539,2.535-17,6.676C55.539,41.535,49.567,39,43,39c-13.807,0-25,11.193-25,25 s11.193,25,25,25c6.567,0,12.539-2.535,17-6.676C64.461,86.465,70.433,89,77,89c13.807,0,25-11.193,25-25S90.807,39,77,39z"
                                  opacity=".35"
                                ></path>
                                <path
                                  fill="#ff1200"
                                  d="M52,60c0-7.24,3.081-13.758,8-18.324C55.539,37.535,49.567,35,43,35c-13.807,0-25,11.193-25,25 s11.193,25,25,25c6.567,0,12.539-2.535,17-6.676C55.081,73.758,52,67.24,52,60z"
                                ></path>
                                <path
                                  fill="#ffc400"
                                  d="M77,35c-6.567,0-12.539,2.535-17,6.676C64.919,46.242,68,52.76,68,60s-3.081,13.758-8,18.324 C64.461,82.465,70.433,85,77,85c13.807,0,25-11.193,25-25S90.807,35,77,35z"
                                ></path>
                                <path
                                  fill="#ff7500"
                                  d="M68,60c0-7.24-3.081-13.758-8-18.324C55.081,46.242,52,52.76,52,60s3.081,13.758,8,18.324 C64.919,73.758,68,67.24,68,60z"
                                ></path>
                              </svg>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="24"
                                height="24"
                                viewBox="0 0 48 48"
                              >
                                <path
                                  fill="#1565C0"
                                  d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"
                                ></path>
                                <path
                                  fill="#FFF"
                                  d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z"
                                ></path>
                                <path
                                  fill="#FFC107"
                                  d="M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029c-1.136,0-4.44,0-4.44,0S10.894,20.84,12.212,24.945z"
                                ></path>
                              </svg>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 462 161"
                              >
                                <g
                                  fill="none"
                                  fill-rule="evenodd"
                                  transform="rotate(-90 80.5 80)"
                                >
                                  <path
                                    fill="#ED342B"
                                    d="M79.9417,159.8534 C36.0001,159.8534 0.3786,124.2319 0.3786,80.2903 C0.3786,36.3467 36.0001,0.7242 79.9417,0.7242 C123.8833,0.7242 159.5048,36.3467 159.5048,80.2903 C159.5048,124.2319 123.8833,159.8534 79.9417,159.8534"
                                  />
                                  <path
                                    fill="#FEFEFE"
                                    d="M45.8608,80.2892 C86.2011,62.4925 123.8866,49.4435 123.8866,49.4435 L123.8866,22.1612 C123.8866,22.1612 75.5171,38.7665 15.0281,69.6112 L15.0281,90.9673 C75.5171,121.812 123.8866,138.4162 123.8866,138.4162 L123.8866,111.1339 C123.8866,111.1339 86.2011,98.086 45.8608,80.2892"
                                  />
                                  <path
                                    fill="#03435F"
                                    d="M84.0912 422.9398C84.0912 407.5169 67.4829 406.3325 67.4829 406.3325L67.4829 439.5441C67.4829 439.5441 84.0912 438.3596 84.0912 422.9398M50.8776 459.7117L50.8776 406.3325C50.8776 406.3325 33.0818 407.5169 33.0818 431.2439 33.0818 443.1044 36.6442 454.9669 36.6442 454.9669L17.665 457.3408C17.665 457.3408 12.9172 445.4783 12.9172 428.87 12.9172 405.146 24.7807 383.7939 57.9943 383.7939 84.0912 383.7939 100.6985 400.4022 100.6985 424.1262 100.6985 459.7117 65.112 462.0826 50.8776 459.7117M78.9061 278.2023L98.492 281.8756C98.492 281.8756 107.098 253.5138 91.1494 230.4615L12.8057 230.4615 12.8057 254.9431 76.4602 254.9431C83.8018 264.7356 78.9061 278.2023 78.9061 278.2023M84.0912 176.1558C84.0912 160.736 67.4829 159.5505 67.4829 159.5505L67.4829 192.7631C67.4829 192.7631 84.0912 191.5787 84.0912 176.1558M50.8776 212.9278L50.8776 159.5505C50.8776 159.5505 33.0818 160.736 33.0818 184.46 33.0818 196.3195 36.6442 208.183 36.6442 208.183L17.665 210.5569C17.665 210.5569 12.9172 198.6934 12.9172 182.0861 12.9172 158.3621 24.7807 137.009 57.9943 137.009 84.0912 137.009 100.6985 153.6173 100.6985 177.3413 100.6985 212.9278 65.112 215.2987 50.8776 212.9278M42.7481 337.948C72.5852 325.5168 100.6842 319.3036 100.6842 319.3036L100.6812 294.4462C100.6812 294.4462 52.6944 306.8764 12.9319 328.0086L12.9319 347.8874C52.6944 369.0206 100.6742 381.4508 100.6742 381.4508L100.6742 356.5923C100.6742 356.5923 72.5852 350.3792 42.7481 337.948"
                                  />
                                </g>
                              </svg>
                              <span className="text-blue-600 font-medium text-sm">
                                +4
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Bank Transfer Option */}
                      <label
                        className={`relative block cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                          form.paymentMethod === "bank"
                            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex items-center space-x-4">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="bank"
                              checked={form.paymentMethod === "bank"}
                              onChange={handleChange}
                              className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  Bank Transfer
                                </p>
                                <p className="text-sm text-slate-600">
                                  Direct bank transfer
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                      {/* Bank Details (shown when bank transfer is selected) */}

                      {form.paymentMethod === "bank" && (
                        <div className="mt-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mr-3">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
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
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
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
                        <div className="p-6">
                          <div className="flex items-center space-x-4">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="pay on delivery"
                              checked={form.paymentMethod === "pay on delivery"}
                              onChange={handleChange}
                              className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  Pay on Delivery (POD)
                                </p>
                                <p className="text-sm text-slate-600">
                                  Direct bank transfer
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
                        className="w-full relative bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
                      >
                        <span
                          className={`flex items-center justify-center ${
                            loading ? "invisible" : ""
                          }`}
                        >
                          Complete Payment • {formatPrice(Subtotal)}
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
                {form.paymentMethod === "paystack" && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50 mt-6">
                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full relative bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      <span
                        className={`flex items-center justify-center ${
                          loading ? "invisible" : ""
                        }`}
                      >
                        Complete Payment • {formatPrice(Subtotal)}
                      </span>
                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loading />
                        </div>
                      )}
                    </button>
                  </div>
                )}
                {/* <div className="hidden">
                  <PaystackButtonComponent {...paystackProps} />
                </div> */}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
