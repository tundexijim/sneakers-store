import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";

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

      <main className="max-w-xl mx-auto py-12 px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>

        {orderNumber ? (
          <p className="text-lg mb-6">
            Your order number is{" "}
            <span className="font-semibold">{orderNumber}</span>.
            <br />A confirmation will be sent to your email.
          </p>
        ) : (
          <p className="text-lg mb-6">Your order was placed successfully.</p>
        )}

        <Link
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </main>
    </>
  );
}
