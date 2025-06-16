import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
      const queryOrderNumber = router.query.orderNumber;
      if (typeof queryOrderNumber === "string") {
        setOrderNumber(queryOrderNumber);
      }
    }
  }, [router.isReady, router.query.orderNumber]);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Order Success</title>
        <meta
          name="description"
          content="Your order has been placed successfully"
        />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

          {/* Success Icon with animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            {/* Celebration dots */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully placed
            and is being processed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Order ID:</strong> {orderNumber}
            </p>
          </div>
          <button
            onClick={() => router.push("/productslist")}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
