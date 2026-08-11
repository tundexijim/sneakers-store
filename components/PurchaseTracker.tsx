import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

interface PurchaseTrackerProps {
  value: number | null; // order amount
  orderNumber: string | null;
  currency?: string; // default to NGN
}

export default function PurchaseTracker({
  value,
  orderNumber,
  currency = "NGN",
}: PurchaseTrackerProps) {
  const eventId = "purchase_" + Date.now();
  const { cart } = useCart();

  useEffect(() => {
    const key = `purchasePixelfired_${orderNumber}`;
    if (!sessionStorage.getItem(key)) {
      if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
        window.fbq(
          "track",
          "Purchase",
          {
            content_ids: cart.map((item) => item.slug),
            content_type: "product_group",
            value,
            currency,
          },
          { eventID: eventId },
        );
        sessionStorage.setItem(key, "true");
      }
    }
  }, [value, currency]);

  return null;
}
