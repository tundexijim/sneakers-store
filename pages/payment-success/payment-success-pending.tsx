// pages/payment-success-order-pending.js
import { useRouter } from "next/router";

export default function PaymentSuccessOrderPending() {
  const router = useRouter();
  const { reference } = router.query;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Pending</h1>
        <p className="text-gray-600 mb-4">
          Your payment has been processed successfully, but there was an issue
          processing your order.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Reference:</strong> {reference}
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Our support team has been automatically notified and will contact you
          within 24 hours to resolve this issue. You may also contact support
          with your order reference.
        </p>
        <button
          onClick={() => router.push("/productslist")}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
