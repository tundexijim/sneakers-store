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
import { Loading } from "@/components/Loading";
import { Building2 } from "lucide-react";

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
    paymentMethod: "paystack",
  });
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRestoredForm, setHasRestoredForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const { paymentMethod, ...rest } = form;
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
      localStorage.setItem("checkoutForm", JSON.stringify(rest));
    }
  }, [rest, hasRestoredForm]);

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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const success = await placeOrder(cart, orderData, setLoading, setError);
      if (success) {
        localStorage.removeItem("orderNumber");
        localStorage.removeItem("checkoutForm");
        router.push(`/payment-success/success?orderNumber=${orderNumber}`);
        clearCart();
      }
      setLoading(false);
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (form.paymentMethod === "bank") {
      handleSubmit();
    } else if (form.paymentMethod === "paystack") {
      handlePay();
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
                  <p>₦{item.price * item.qty}</p>
                </div>
              ))}
              <p className="flex justify-between">
                Shipping <span>₦{ShippingCost}</span>
              </p>
              <div className="font-semibold flex justify-between pt-4 border-t">
                <p>Total:</p>
                <p>₦{Subtotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
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
                <input
                  type="address"
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

              <div className="mx-auto ">
                <div className="pb-2 space-y-6">
                  {/* Delivery Fee */}
                  <div className="bg-white rounded-lg border-2 border-blue-300 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Sub Total</span>
                      <span className="text-lg font-semibold">₦{Subtotal}</span>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Payment</h2>
                      <p className="text-gray-600">
                        All transactions are secure and encrypted.
                      </p>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      {/* Paystack Option */}
                      <label
                        className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-colors block ${
                          form.paymentMethod === "paystack"
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="paystack"
                              checked={form.paymentMethod === "paystack"}
                              onChange={handleChange}
                              className="w-5 h-5 text-blue-500 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="font-medium">Paystack</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="30"
                              height="30"
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
                            <div className="text-blue-600 font-bold text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="30"
                                height="30"
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
                            </div>
                            <div className="w-6 h-4 bg-yellow-400 rounded text-xs flex items-center justify-center font-bold">
                              MTN
                            </div>
                            <span className="text-blue-500 font-medium">
                              +4
                            </span>
                          </div>
                        </div>
                      </label>

                      {/* Bank Transfer Option */}
                      <label
                        className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-colors block ${
                          form.paymentMethod === "bank"
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank"
                            checked={form.paymentMethod === "bank"}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-500 border-gray-300 focus:ring-blue-500"
                          />
                          <Building2 className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Bank Transfer</span>
                        </div>
                      </label>
                    </div>

                    {/* Bank Details (shown when bank transfer is selected) */}
                    {form.paymentMethod === "bank" && (
                      <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                        <p className="font-medium mb-3">
                          Complete your transaction with the below bank details:
                        </p>
                        <div className="space-y-1">
                          <p>
                            <span className="font-medium">Account name:</span>{" "}
                            Akinloye Olaoye
                          </p>
                          <p>
                            <span className="font-medium">Account No:</span>{" "}
                            6541274738
                          </p>
                          <p>
                            <span className="font-medium">Bank Name:</span>{" "}
                            Moniepoint MFB
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          All orders will be fulfilled immediately after your
                          payment is confirmed
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Billing Address */}
                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  {/* Complete Payment Button */}
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors grid place-items-center"
                    disabled={loading}
                    type="submit"
                  >
                    <span
                      className={`col-start-1 row-start-1 ${
                        loading ? "invisible" : ""
                      }`}
                    >
                      Complete Payment
                    </span>
                    {loading && (
                      <div className="col-start-1 row-start-1">
                        <Loading />
                      </div>
                    )}
                  </button>
                </div>

                {/* Bottom Navigation Indicator */}
                <div className="flex justify-center pb-4">
                  <div className="w-32 h-1 bg-black rounded-full"></div>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
